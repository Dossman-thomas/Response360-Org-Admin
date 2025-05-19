import { UserModel } from '../database/models/index.js';
import { decryptService } from './index.js';
import { createError, validatePasswordStrength } from '../utils/index.js';

export const updateUserPasswordService = async (payload) => {
  try {
    // Validate the payload
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

    // validate the decrypted payload
    if (!decryptedPayload) {
      throw createError('Decryption failed', 400, {
        code: 'DECRYPTION_PAYLOAD_FAILED',
      });
    }

    const { userId, newPassword } = decryptedPayload;

    // validate password strength of new password
    const { isValid, message } = validatePasswordStrength(newPassword);

    if (!isValid) {
      throw createError(message, 400, {
        code: 'PASSWORD_STRENGTH_INVALID',
      });
    }

    // Find the user by userId
    const foundUser = await UserModel.findOne({
      where: { user_id: userId },
    });

    if (!foundUser) {
      throw createError('User not found', 404, {
        code: 'USER_NOT_FOUND',
      });
    }

    // Step 3: Update the password (Sequelize hook will hash it)
    foundUser.user_password = newPassword;
    await foundUser.save();

    return {
      success: true,
      message: 'Password updated successfully.',
    };
  } catch (error) {
    console.error('Error in updateUserPasswordService:', error.message);
    throw createError('Failed to update password', 500, {
      code: 'UPDATE_PASSWORD_FAILED',
    });
  }
};
