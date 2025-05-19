import jwt from 'jsonwebtoken';
import {
  getUserByEmailService,
  sendResetPasswordEmailService,
  encryptService,
  decryptService,
} from './index.js';
import { logServiceError, createError } from '../utils/index.js';
import { env } from '../config/index.js';

export const forgotPasswordService = async (payload) => {

  // Validate payload before decryption
  if (!payload || typeof payload !== 'string') {
    throw createError('Invalid payload. Please provide valid data.', 400, {
      code: 'INVALID_PAYLOAD',
    });
  }

  try {
    // pass encrypted payload to getUserByEmailService
    const foundUser = await getUserByEmailService(payload);

    // Check if the user was found
    if (!foundUser) {
      throw createError('User not found.', 404, {
        code: 'USER_NOT_FOUND',
      });
    }

    // decrypt the foundUser
    const decryptedUser = await decryptService(foundUser);

    // extract user_id, email, first_name from decryptedPayload
    const { user_id, user_email, first_name } = decryptedUser;

    // Validate structure of decryptedUser
    if (!user_id || !user_email || !first_name) {
      throw createError('Decrypted user data is incomplete.', 400, {
        code: 'INCOMPLETE_USER_DATA',
      });
    }

    // Generate a JWT token that lasts for 15 minutes
    const token = jwt.sign({ userId: user_id }, env.jwt.secret, {
      expiresIn: env.jwt.forgotPass,
    });

    // Encrypt the token to securely pass in the email URL
    const encryptedToken = await encryptService(token);

    // Check if the encryption was successful
    if (!encryptedToken) {
      throw createError('Encryption failed.', 500, {
        code: 'ENCRYPTION_FAILED',
      });
    }

    // Encode the token to make it URL-safe
    const encodedToken = encodeURIComponent(encryptedToken);
    // resetLink includes encryptedToken so as not to be exposed in the URL
    const resetLink = `${env.frontEndUrl}/reset-password?token=${encodedToken}`;

    const to = user_email; // The recipient's email address

    // encrypt the payload to pass to sendResetPasswordEmailService, which expects this
    const newPayload = await encryptService({
      to,
      resetLink,
      first_name,
    });

    // call sendResetPasswordEmailService with the encrypted payload
    const emailSent = await sendResetPasswordEmailService(newPayload);

    // Check if the email was sent successfully
    if (!emailSent) {
      throw createError('Failed to send email.', 500, {
        code: 'EMAIL_SEND_FAILED',
      });
    }

    // Return success
    return true;
  } catch (error) {
    logServiceError('forgotPasswordService', error);
    throw createError(
      error.message || 'An error occurred during password reset.',
      error.status || 500,
      {
        code: 'PASSWORD_RESET_FAILED',
      }
    );
  }
};
