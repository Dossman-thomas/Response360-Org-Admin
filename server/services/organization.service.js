import { OrganizationModel, UserModel } from '../database/models/index.js';
import { sequelize } from '../config/index.js';
import { env } from '../config/index.js';
import {
  pagination,
  buildWhereClause,
  buildOrderClause,
  encryptFields,
  decryptFields,
  decryptUserFields,
  checkDupEmailsOnCreateOrg,
  checkDupEmailsOnUpdateOrg,
  generatePassword,
  createError,
} from '../utils/index.js';
import { encryptService, decryptService } from '../services/index.js';
import { v4 as uuidv4, validate as isUuid } from 'uuid';

const pubkey = env.encryption.pubkey;

// Validate pubkey
if (!pubkey) {
  createError('Public key is missing in the environment variables.', 500, {
    code: 'MISSING_PUBKEY',
  });
}

// Create Organization Service
export const createOrganizationService = async (payload) => {
  const transaction = await sequelize.transaction();
  try {
    // Validate payload before decryption
    if (!payload || typeof payload !== 'string') {
      throw createError('Invalid payload. Please provide valid data.', 400, {
        code: 'INVALID_PAYLOAD',
      });
    }

    // Decrypt the incoming payload
    const orgData = await decryptService(payload);

    // Validate decrypted data
    if (!orgData || typeof orgData !== 'object') {
      throw createError(
        'Decryption failed or missing organization data.',
        400,
        { code: 'DECRYPTION_FAILED' }
      );
    }

    const decryptedOrgEmail = orgData.orgEmail;
    const decryptedUserEmail = orgData.adminEmail;

    // Check for duplicate email (excluding this org)
    const dupErrorsCreate = await checkDupEmailsOnCreateOrg(
      decryptedOrgEmail,
      decryptedUserEmail
    );

    // If there are errors for the organization or admin email, throw them
    if (dupErrorsCreate?.orgEmail || dupErrorsCreate?.adminEmail) {
      // Throwing both errors if both are found
      throw new Error(
        `${dupErrorsCreate?.orgEmail ? dupErrorsCreate.orgEmail : ''} ${
          dupErrorsCreate?.adminEmail ? dupErrorsCreate.adminEmail : ''
        }`.trim()
      );
    }

    // Validate admin user data before creation
    if (
      !orgData.adminFirstName ||
      !orgData.adminLastName ||
      !orgData.adminEmail ||
      !orgData.adminPhone
    ) {
      throw createError('Admin user data is incomplete.', 400, {
        code: 'INVALID_ADMIN_DATA',
      });
    }

    // Encrypt destructured sensitive data using the utility function
    const {
      orgName,
      orgEmail,
      orgPhone,
      registeredAddress,
      website,
      logo,
      adminFirstName,
      adminLastName,
      adminEmail,
      adminPhone,
    } = encryptFields(orgData, pubkey);

    // Create the organization
    const organization = await OrganizationModel.create(
      {
        org_id: uuidv4(),
        org_name: orgName,
        org_email: orgEmail,
        org_phone_number: orgPhone,
        org_status: true,
        org_type: orgData.orgType,
        jurisdiction: orgData.jurisdictionSize,
        org_address: registeredAddress,
        website: website,
        logo: logo,
        org_created_by: orgData.decryptedUserId,
      },
      { transaction }
    );

    // Create the admin user
    await UserModel.create(
      {
        user_id: uuidv4(),
        first_name: adminFirstName,
        last_name: adminLastName,
        user_email: adminEmail,
        user_phone_number: adminPhone,
        user_role: env.roles.a,
        org_id: organization.org_id,
        user_password: generatePassword(), // Temporary password
        user_created_by: orgData.decryptedUserId, // Created by the same user who created the organization
      },
      { transaction }
    );

    await transaction.commit();
    return;
  } catch (error) {
    console.error('Error in createOrganizationService:', error);
    await transaction.rollback();
    throw createError('Failed to create organization and admin user.', 500, {
      code: 'CREATION_FAILED',
      log: true,
    });
  }
};

// Read Organization Service
export const getAllOrganizationsService = async (payload) => {
  try {
    // Validate the payload before decryption
    if (!payload || typeof payload !== 'string') {
      throw createError('Invalid payload. Please provide valid data.', 400, {
        code: 'INVALID_PAYLOAD',
      });
    }

    // decrypt the payload
    const decryptedPayload = await decryptService(payload);

    // Validate decrypted data
    if (!decryptedPayload || typeof decryptedPayload !== 'object') {
      throw createError('Decryption failed or missing data.', 400, {
        code: 'DECRYPTION_FAILED',
      });
    }

    // extract params from payload
    const { page, limit, sorts, filters, searchQuery } = decryptedPayload;

    // build clauses
    const order = buildOrderClause(sorts);
    const where = buildWhereClause({
      filters,
      searchQuery,
      statusQuery: searchQuery,
      pubkey,
    });

    const organizationData = await OrganizationModel.findAndCountAll({
      where,
      order,
      attributes: [
        'org_id',
        ...decryptFields(['org_name', 'org_email', 'org_phone_number'], pubkey),
        'org_status',
      ],
      ...pagination({ page, limit }),
    });

    const encryptedOrgData = encryptService(organizationData);

    return encryptedOrgData;
  } catch (error) {
    console.error('Error in getAllOrganizationsService:', error);
    if (error.parent) {
      console.error('Detailed DB Error:', error.parent);
    }
    throw createError('Failed to retrieve organizations.', 500, {
      code: 'RETRIEVAL_FAILED',
      log: true,
    });
  }
};

// Get Organization By ID Service
export const getOrganizationByIdService = async (orgId) => {
  try {
    // Validate orgId
    if (!orgId || !isUuid(orgId)) {
      throw createError('Invalid organization ID.', 400, {
        code: 'INVALID_ORG_ID',
      });
    }

    const foundOrg = await OrganizationModel.findOne({
      where: { org_id: orgId },
      include: [
        {
          model: UserModel,
          as: 'users',
          where: { user_role: 'Admin' }, // Only fetch the admin user associated with this organization
          attributes: decryptUserFields(
            ['first_name', 'last_name', 'user_email', 'user_phone_number'],
            pubkey
          ),
          required: false, // This ensures that even if there are no users, the organization will still be returned
        },
      ],

      attributes: [
        'org_id',
        ...decryptFields(
          [
            'org_name',
            'org_email',
            'org_phone_number',
            'org_address',
            'website',
            'logo',
          ],
          pubkey
        ),
        'org_type',
        'jurisdiction',
        'org_status',
        'org_created_at',
        'org_updated_at',
      ],
    });

    // Check if organization exists
    if (!foundOrg) {
      throw createError('Organization not found.', 404, {
        code: 'ORG_NOT_FOUND',
      });
    }

    // Prepare the data object for encryption
    const orgData = {
      orgId: foundOrg.org_id, // Ensuring consistency with camelCase naming
      orgName: foundOrg.org_name,
      orgEmail: foundOrg.org_email,
      orgPhone: foundOrg.org_phone_number,
      orgType: foundOrg.org_type,
      jurisdictionSize: foundOrg.jurisdiction,
      registeredAddress: foundOrg.org_address,
      website: foundOrg.website,
      logo: foundOrg.logo,
      status: foundOrg.org_status,
      orgCreatedAt: foundOrg.org_created_at,
      orgUpdatedAt: foundOrg.org_updated_at,
      adminUser: foundOrg.users?.length
        ? {
            firstName: foundOrg.users[0].first_name,
            lastName: foundOrg.users[0].last_name,
            userEmail: foundOrg.users[0].user_email,
            userPhoneNumber: foundOrg.users[0].user_phone_number,
          }
        : null, // In case no admin user is found
    };

    // Encrypt the organization data
    const encryptedOrgData = encryptService(orgData);

    return encryptedOrgData;
  } catch (error) {
    console.error('Error in getOrganizationByIdService:', error);
    if (error.parent) {
      console.error('Detailed DB Error:', error.parent);
    }
    throw createError('Failed to retrieve organization.', 500, {
      code: 'ORG_RETRIEVAL_FAILED',
      log: true,
    });
  }
};

// Update Organization Service
export const updateOrganizationService = async (orgId, payload) => {
  try {
    // Validate orgId
    if (!orgId || !isUuid(orgId)) {
      throw createError('Invalid organization ID.', 400, {
        code: 'INVALID_ORG_ID',
      });
    }

    // Decrypt the incoming data
    const orgData = await decryptService(payload);

    if (!orgData) {
      throw createError('Failed to decrypt organization data.', 400, {
        code: 'DECRYPTION_FAILED',
      });
    }

    const decryptedOrgEmail = orgData.orgEmail;

    // Check for duplicate email (excluding this org)
    const dupErrors = await checkDupEmailsOnUpdateOrg(orgId, decryptedOrgEmail);

    // If there are errors, throw them
    if (dupErrors.orgEmail) {
      throw createError(dupErrors.orgEmail, 400, {
        code: 'DUPLICATE_EMAIL',
      });
    }

    // Encrypt sensitive data
    const { orgName, orgEmail, orgPhone, registeredAddress, website, logo } =
      encryptFields(orgData, pubkey);

    // Step 3: Update the organization
    const [rowsAffected] = await OrganizationModel.update(
      {
        org_name: orgName,
        org_email: orgEmail,
        org_phone_number: orgPhone,
        org_type: orgData.orgType,
        jurisdiction: orgData.jurisdictionSize,
        org_address: registeredAddress,
        website: website,
        logo: logo,
        org_status: orgData.status === 'Disabled' ? false : true,
        org_updated_at: new Date(),
        org_updated_by: orgData.decryptedUserId,
      },
      { where: { org_id: orgId } }
    );

    // If no organization was found
    if (rowsAffected === 0) {
      throw createError('Organization not found.', 404, {
        code: 'ORG_NOT_FOUND',
      });
    }

    return;
  } catch (error) {
    console.error('Error in updateOrganizationService:', error);
    if (error.parent) {
      console.error('Detailed DB Error:', error.parent);
    }
    throw createError('Failed to update organization.', 500, {
      code: 'ORG_UPDATE_FAILED',
      log: true,
    });
  }
};

// Delete Organization Service
export const deleteOrganizationService = async (orgId, payload) => {
  try {
    // Decrypt the incoming payload (which contains both orgId and userId)
    const decryptedData = await decryptService(payload);
    // Check if the decrypted data is valid
    if (!decryptedData || !decryptedData.userId || !decryptedData.orgId) {
      throw createError('Failed to decrypt required data.', 400, {
        code: 'DECRYPTION_FAILED',
      });
    }

    // Validate orgId
    if (!orgId || !isUuid(orgId)) {
      throw createError('Invalid organization ID.', 400, {
        code: 'INVALID_ORG_ID',
      });
    }

    // Ensure the decrypted orgId matches the requested one
    if (decryptedData.orgId !== orgId) {
      throw createError('Mismatched organization ID after decryption.', 400, {
        code: 'ORG_ID_MISMATCH',
      });
    }

    // Soft delete the organization
    const [updated] = await OrganizationModel.update(
      {
        org_status: false,
        org_deleted_by: decryptedData.userId,
        org_deleted_at: new Date(),
      },
      {
        where: { org_id: orgId },
      }
    );

    // If no organization was found throw an error
    if (updated === 0) {
      throw createError('Organization not found or already deleted.', 404, {
        code: 'ORG_NOT_FOUND_OR_DELETED',
      });
    }

    return;
  } catch (error) {
    console.error('Error in deleteOrganizationService:', error);
    if (error.parent) {
      console.error('Detailed DB Error:', error.parent);
    }
    throw createError('Failed to delete organization.', 500, {
      code: 'ORG_DELETE_FAILED',
      log: true,
    });
  }
};
