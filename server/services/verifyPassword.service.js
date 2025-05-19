import { UserModel } from '../database/models/index.js';
import { env } from '../config/index.js';
import { decryptSensitiveData, createError } from '../utils/index.js';
import { decryptService } from './index.js';

const pubkey = env.encryption.pubkey;

if(!pubkey){
  throw createError('Public key is not defined in the environment variables', 500, {
    code: 'PUBLIC_KEY_NOT_DEFINED',
  });
}

export const verifyPasswordService = async (payload) => {
  try {
    // validate the payload
    if (!payload) {
      throw createError('Encrypted payload string is required', 400, {
        code: 'ENCRYPTED_PAYLOAD_MISSING',
      });
    }

    // Check if the payload is a string
    if (typeof payload !== 'string') {
      throw createError('Encrypted payload must be a string', 400, {
        code: 'ENCRYPTED_PAYLOAD_INVALID',
      });
    }

    // Decrypt the payload
    const decryptedPayload = await decryptService(payload);

    if (!decryptedPayload) {
      throw createError('Decryption failed', 400, {
        code: 'DECRYPTION_PAYLOAD_FAILED',
      });
    }

    const { user_email, currentPassword } = decryptedPayload;

    // Find the user by email
    const sequelize = UserModel.sequelize;
    const [decryptedExpr] = decryptSensitiveData('user_email', pubkey);

    // Find the user by matching the decrypted email
    const foundUser = await UserModel.findOne({
      where: sequelize.where(decryptedExpr, user_email),
    });

    if (!foundUser) {
      throw createError('User not found', 404, {
        code: 'USER_NOT_FOUND',
      });
    }

    // Verify the password
    const isMatch = await foundUser.verifyPassword(currentPassword);

    // If the password does not match, throw an error
    if (!isMatch) {
      throw createError('Password not match', 401, {
        code: 'PASSWORD_NOT_MATCH',
      });
    }

    return {
      success: true,
      message: 'Password verified successfully.',
    };
  } catch (error) {
    console.error('Error in verifyPasswordService:', error.message);
    throw createError('Failed to verify password', 500, {
      code: 'PASSWORD_VERIFICATION_FAILED'
    });
  }
};
