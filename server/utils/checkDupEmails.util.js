import { OrganizationModel, UserModel } from '../database/models/index.js';
import { Sequelize } from 'sequelize';
import { env } from '../config/index.js';

const pubkey = env.encryption.pubkey;

// Check for duplicate emails on CREATE
export const checkDupEmailsOnCreateOrg = async (orgEmail, adminEmail) => {

  
  const orgMatch = await OrganizationModel.findOne({
    where: Sequelize.literal(
      `PGP_SYM_DECRYPT(org_email::bytea, '${pubkey}') = '${orgEmail}'`
    ),
  });

  const adminMatch = await UserModel.findOne({
    where: Sequelize.literal(
      `PGP_SYM_DECRYPT(user_email::bytea, '${pubkey}') = '${adminEmail}'`
    ),
  });

  // Initialize errors object
  const errors = {};

  // Add errors if any email is found
  if (orgMatch) {
    errors.orgEmail = 'Organization email is already in use.';
  }
  
  if (adminMatch) {
    errors.adminEmail = 'Admin email is already in use.';
  }

  // Return errors if any, else return an empty object
  return Object.keys(errors).length > 0 ? errors : null;
};

// Check for duplicate org email on UPDATE
export const checkDupEmailsOnUpdateOrg = async (orgId, decryptedOrgEmail) => {
  try {

    const orgMatch = await OrganizationModel.findOne({
      where: {
        [Sequelize.Op.and]: [
          Sequelize.literal(
            `PGP_SYM_DECRYPT(org_email::bytea, '${pubkey}') = '${decryptedOrgEmail}'`
          ),
          { org_id: { [Sequelize.Op.ne]: orgId } },
        ],
      },
    });

    if (orgMatch) {
      console.log('Duplicate org email found!');
    }

    const errors = {
      orgEmail: orgMatch ? 'Organization email is already in use.' : null,
    };

    return errors;
  } catch (error) {
    console.error('Error checking for duplicate org email:', error);
    throw error;
  }
};

