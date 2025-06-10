import { UserModel, RoleModel } from '../database/models/index.js';
import { env } from '../config/index.js';
import { encryptService, decryptService } from './index.js';
import {
  decryptFields,
  encryptFields,
  decryptSensitiveData,
  encryptSensitiveData,
  createError,
  emailRegex,
  generatePassword,
  buildOrderClause,
  buildWhereClause,
  pagination,
} from '../utils/index.js';
import { v4 as uuidv4, validate as isUuid } from 'uuid';

const pubkey = env.encryption.pubkey;

// Validate the public key
if (!pubkey) {
  throw createError(
    'Public key is not defined in the environment variables.',
    500,
    { code: 'PUBKEY_MISSING', log: true }
  );
}

// Create a new user
export const createUserService = async (payload) => {
  const transaction = await sequelize.transaction();
  try {
    const userData = await decryptService(payload);

    if (!userData || typeof userData !== 'object') {
      throw createError('Failed to decrypt user data.', 400, {
        code: 'DECRYPTION_FAILED',
      });
    }

    const {
      firstName,
      lastName,
      userEmail,
      userPhone,
      userRole,
      orgId,
      decryptedUserId,
    } = userData;

    if (!firstName || !lastName || !userEmail || !userPhone || !userRole || !orgId) {
      throw createError('Missing required user fields.', 400, {
        code: 'INVALID_USER_DATA',
      });
    }

    // Verify that creator's org matches orgId in payload
    const creator = await UserModel.findOne({ where: { user_id: decryptedUserId } });
    if (!creator) {
      throw createError('Creator user not found.', 404);
    }
    if (creator.org_id !== orgId && !creator.is_super_admin) {
      throw createError('Unauthorized to create user for this organization.', 403);
    }

    // Lookup role ID
    const roleRecord = await RoleModel.findOne({ where: { role_title: userRole } });
    if (!roleRecord) {
      throw createError('Invalid user role.', 400, { code: 'INVALID_ROLE' });
    }

    const encryptedFields = encryptFields(
      { firstName, lastName, userEmail, userPhone },
      pubkey
    );

    await UserModel.create(
      {
        user_id: uuidv4(),
        first_name: encryptedFields.firstName,
        last_name: encryptedFields.lastName,
        user_email: encryptedFields.userEmail,
        user_phone_number: encryptedFields.userPhone,
        user_role: userRole,
        role_id: roleRecord.role_id,
        org_id: orgId,
        user_password: generatePassword(),
        user_created_by: decryptedUserId,
      },
      { transaction }
    );

    await transaction.commit();
    return;
  } catch (error) {
    console.error('Error in createUserService:', error);
    await transaction.rollback();
    throw createError('Failed to create user.', 500, {
      code: 'USER_CREATION_FAILED',
      log: true,
    });
  }
};

// get all users
export const getAllUsersService = async (payload) => {
  try {
    if (!payload || typeof payload !== 'string') {
      throw createError('Invalid payload.', 400, { code: 'INVALID_PAYLOAD' });
    }

    const decryptedPayload = await decryptService(payload);

    if (!decryptedPayload || typeof decryptedPayload !== 'object') {
      throw createError('Failed to decrypt data.', 400, {
        code: 'DECRYPTION_FAILED',
      });
    }

    const { page, limit, sorts, filters, searchQuery } = decryptedPayload;

    const order = buildOrderClause(sorts);
    const where = buildWhereClause({
      filters,
      searchQuery,
      statusQuery: searchQuery,
      pubkey,
    });

    const userData = await UserModel.findAndCountAll({
      where,
      order,
      attributes: [
        'user_id',
        ...decryptFields(['first_name', 'last_name', 'user_email', 'user_phone_number'], pubkey),
        'user_role',
        'user_status',
      ],
      ...pagination({ page, limit }),
    });

    return encryptService(userData);
  } catch (error) {
    console.error('Error in getAllUsersService:', error);
    throw createError('Failed to retrieve users.', 500, {
      code: 'USER_RETRIEVAL_FAILED',
      log: true,
    });
  }
};


// Update a user
export const updateUserService = async (payload) => {
  try {
    // Decrypt the incoming payload
    const userData = await decryptService(payload);

    if (!userData) {
      throw createError('Failed to decrypt user data.', 400, {
        code: 'DECRYPTION_FAILED',
      });
    }

    const userId = userData.userId;
    if (!userId) {
      throw createError('Missing user ID in decrypted payload.', 400, {
        code: 'MISSING_USER_ID',
      });
    }

    // Encrypt sensitive fields
    const firstName = userData.first_name
      ? encryptSensitiveData(userData.first_name, pubkey)
      : undefined;
    const lastName = userData.last_name
      ? encryptSensitiveData(userData.last_name, pubkey)
      : undefined;
    const phone = userData.user_phone_number
      ? encryptSensitiveData(userData.user_phone_number, pubkey)
      : undefined;

    // Build update object
    const updateData = {
      ...(firstName && { first_name: firstName }),
      ...(lastName && { last_name: lastName }),
      ...(phone && { user_phone_number: phone }),
      ...(userData.user_role && { user_role: userData.user_role }),
      user_updated_by: userData.decryptedUserId,
      user_updated_at: new Date(),
    };

    // Run the update
    const [rowsAffected] = await UserModel.update(updateData, {
      where: {
        user_id: userId,
        user_deleted_at: null,
      },
    });

    if (rowsAffected === 0) {
      throw createError('User not found or already deleted.', 404, {
        code: 'USER_NOT_FOUND',
      });
    }

    return;
  } catch (error) {
    console.error('Error in updateUserService:', error);
    if (error.parent) {
      console.error('DB Error:', error.parent);
    }
    throw createError('Failed to update user.', 500, {
      code: 'USER_UPDATE_FAILED',
      log: true,
    });
  }
};

// Get user by Email
export const getUserByEmailService = async (payload) => {
  try {
    let decryptedPayload;
    try {
      decryptedPayload = await decryptService(payload);
    } catch (error) {
      throw createError('Failed to decrypt the payload.', 400, {
        code: 'DECRYPTION_FAILED',
        log: true,
      });
    }

    const { user_email: email } = decryptedPayload;
    // Validate the encrypted payload
    if (!email || typeof email !== 'string') {
      throw createError('Invalid payload. Email is required.', 400, {
        code: 'EMAIL_REQUIRED',
      });
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      throw createError('Invalid email format.', 400, {
        code: 'INVALID_EMAIL_FORMAT',
      });
    }

    const sequelize = UserModel.sequelize;
    const [decryptedExpr] = decryptSensitiveData('user_email', pubkey);
    const foundUser = await UserModel.findOne({
      attributes: [
        'user_id',
        ...decryptFields(
          ['first_name', 'last_name', 'user_email', 'user_phone_number'],
          pubkey
        ),
      ],
      where: sequelize.where(decryptedExpr, email),
    });

    if (!foundUser) {
      throw createError('User not found.', 404, { code: 'USER_NOT_FOUND' });
    }

    return encryptService(foundUser);
  } catch (error) {
    console.error('Error fetching user by email:', error);
    if (error.status) throw error; // pass through known errors
    throw createError('Failed to fetch user.', 500, {
      code: 'USER_FETCH_FAILED',
      log: true,
    });
  }
};

// Get user by ID
export const getUserByIdService = async (payload) => {
  try {
    let decryptedPayload;
    try {
      decryptedPayload = await decryptService(payload);
    } catch (error) {
      throw createError('Failed to decrypt the payload.', 400, {
        code: 'DECRYPTION_FAILED',
        log: true,
      });
    }

    const { user_id: userId } = decryptedPayload;

    // Validate the decrypted payload
    if (!userId || typeof userId !== 'string') {
      throw createError('Invalid payload. User ID is required.', 400, {
        code: 'USER_ID_REQUIRED',
      });
    }

    const foundUser = await UserModel.findOne({
      attributes: [
        'user_id',
        'user_role',
        ...decryptFields(
          ['first_name', 'last_name', 'user_email', 'user_phone_number'],
          pubkey
        ),
      ],
      where: { user_id: userId },
    });

    if (!foundUser) {
      throw createError('User not found.', 404, {
        code: 'USER_NOT_FOUND',
      });
    }

    return encryptService(foundUser);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    if (error.status) throw error; // Pass through known custom errors
    throw createError('Failed to fetch user.', 500, {
      code: 'USER_FETCH_FAILED',
      log: true,
    });
  }
};

// DELETE User (soft delete)
export const deleteUserService = async (userId, payload) => {
  try {
    if (!userId || !isUuid(userId)) {
      throw createError('Invalid user ID.', 400, { code: 'INVALID_USER_ID' });
    }

    const decrypted = await decryptService(payload);
    if (!decrypted?.userId) {
      throw createError('Failed to decrypt user data.', 400, {
        code: 'DECRYPTION_FAILED',
      });
    }

    const user = await UserModel.findOne({ where: { user_id: userId } });

    if (!user) {
      throw createError('User not found.', 404, { code: 'USER_NOT_FOUND' });
    }

    // Attach deleted_by before destroy to log who deleted
    user.user_deleted_by = decrypted.userId;
    await user.save();

    // Soft delete: triggers beforeDestroy, sets user_status = false and deleted timestamp
    await user.destroy();

    return;
  } catch (error) {
    console.error('Error in deleteUserService:', error);
    throw createError('Failed to delete user.', 500, {
      code: 'USER_DELETE_FAILED',
      log: true,
    });
  }
};


