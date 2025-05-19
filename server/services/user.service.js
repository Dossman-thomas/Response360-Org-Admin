import { UserModel } from '../database/models/index.js';
import { env } from '../config/index.js';
import { encryptService, decryptService } from './index.js';
import {
  decryptFields,
  decryptSensitiveData,
  createError,
  emailRegex,
} from '../utils/index.js';

const pubkey = env.encryption.pubkey;

// Validate the public key
if (!pubkey) {
  throw createError(
    'Public key is not defined in the environment variables.',
    500,
    { code: 'PUBKEY_MISSING', log: true }
  );
}

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
