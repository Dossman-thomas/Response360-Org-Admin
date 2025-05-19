import jwt from 'jsonwebtoken';
import { UserModel } from '../database/models/index.js';
import { env } from '../config/index.js';
import { decryptService } from './index.js';
import { validatePasswordStrength, createError } from '../utils/index.js';

export const passwordResetService = async (payload) => {
  try {
    // Validate payload before decryption
    if (!payload || typeof payload !== 'string') {
      throw createError('Invalid payload. Please provide valid data.', 400, {
        code: 'INVALID_PAYLOAD',
      });
    }

    // Validate presence of environment variables
    if (!env.jwt.secret) {
      throw createError('Missing JWT secret in environment variables.', 500, {
        code: 'MISSING_JWT_SECRET',
      });
    }

    // Decrypt the payload
    const decryptedPayload = await decryptService(payload);
    // Extract token and newPassword from the decrypted payload
    const { token, newPassword } = decryptedPayload;
    // validate structure of decrypted payload
    if (!token || !newPassword) {
      throw createError(
        'Invalid payload structure. Missing token or newPassword.',
        400,
        {
          code: 'INVALID_PAYLOAD_STRUCTURE',
        }
      );
    }

    // Validate password strength
    const passwordValidationResult = validatePasswordStrength(newPassword);
    if (!passwordValidationResult.isValid) {
      throw createError(
        'Password does not meet the required strength criteria.',
        400,
        {
          code: 'PASSWORD_STRENGTH_INVALID',
        }
      );
    }

    // Decode URL-safe token
    let decodedToken;
    try {
      decodedToken = decodeURIComponent(token);
    } catch (error) {
      throw createError('Malformed token. Failed to decode.', 400, {
        code: 'MALFORMED_TOKEN',
      });
    }

    // Decrypt the token
    let decryptedToken;
    try {
      decryptedToken = await decryptService(decodedToken);
    } catch (error) {
      throw createError('Decryption failed. Invalid token.', 400, {
        code: 'DECRYPTION_FAILED',
      });
    }

    // Now verify the decrypted token
    let verifiedToken;
    try {
      verifiedToken = jwt.verify(decryptedToken, env.jwt.secret);
    } catch (error) {
      throw createError('Token verification failed.', 400, {
        code: 'TOKEN_VERIFICATION_FAILED',
      });
    }

    // Validate the structure of the decrypted token
    if (!verifiedToken || !verifiedToken.userId) {
      throw createError(
        'Invalid payload structure. Missing userId in token.',
        400,
        {
          code: 'INVALID_PAYLOAD_STRUCTURE',
        }
      );
    }

    // Find the user based on the decoded userId
    const foundUser = await UserModel.findOne({
      where: { user_id: verifiedToken.userId },
    });

    // Check if the user exists
    if (!foundUser) {
      throw createError('User not found.', 404, {
        code: 'USER_NOT_FOUND',
      });
    }

    // Step 3: Update the user's password (no need to hash it manually due to the hooks)
    foundUser.user_password = newPassword; // This will automatically be hashed before saving due to the beforeUpdate hook
    await foundUser.save();

    return { success: true, message: 'Password reset successfully' };
  } catch (error) {
    // Handle token expiration and other errors
    if (error instanceof jwt.TokenExpiredError) {
      return { success: false, message: 'Reset token expired' };
    } else if (error instanceof jwt.JsonWebTokenError) {
      return { success: false, message: 'Invalid token' };
    } else if (
      error instanceof Error &&
      error.message.includes('Invalid payload structure')
    ) {
      return { success: false, message: 'Payload structure is invalid' };
    }

    console.error('Password reset error:', error);
    return {
      success: false,
      message: error.message || 'Failed to reset password',
    };
  }
};
