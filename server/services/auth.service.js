import { UserModel } from '../database/models/index.js';
import { encryptService, decryptService } from '../services/index.js';
import {
  decryptSensitiveData,
  logServiceError,
  checkRateLimit,
  resetRateLimit,
  createError,
} from '../utils/index.js';
import bcrypt from 'bcrypt';
import { env } from '../config/index.js';

// Validate required environment variables
if (!env.jwt.secret || !env.jwt.expires || !env.jwt.rememberMe) {
  throw createError(
    'Missing one or more required JWT environment variables.',
    500,
    {
      code: 'JWT_ENV_VARIABLES_MISSING',
    }
  );
}

// import jwt after env validation to avoid unnecessary imports if env variables are missing
import jwt from 'jsonwebtoken';

// Set up the encryption public key from environment variables
const pubkey = env.encryption.pubkey;

// Validate pubkey
if (!pubkey) {
  createError('Public key is missing in the environment variables.', 500, {
    code: 'MISSING_PUBKEY',
  });
}

export const orgAdminLoginService = async (payload) => {
  try {
    // Validate payload before decryption
    if (!payload || typeof payload !== 'string') {
      throw createError('Invalid payload. Please provide valid data.', 400, {
        code: 'INVALID_PAYLOAD',
      });
    }

    // Decrypt the payload first (decryptService should return { user_email, user_password })
    const decryptedData = await decryptService(payload);
    // Check if decryption was successful and contains the required fields
    if (!decryptedData.user_email || !decryptedData.user_password) {
      throw createError(
        'Service: Decryption failed or missing credentials.',
        400,
        {
          code: 'DECRYPTION_FAILED',
        }
      );
    }
    // Extract user_email, user_password, and rememberMe from decrypted data
    const { user_email, user_password, user_confirm_password, rememberMe } =
      decryptedData;

    // Validate required fields
    if (!user_email || !user_password || !user_confirm_password) {
      throw createError('Missing required login credentials.', 400, {
        code: 'MISSING_CREDENTIALS',
      });
    }

    // Validate password match
    if (user_password !== user_confirm_password) {
      throw createError('Passwords do not match.', 401, {
        code: 'PASSWORD_MISMATCH',
      });
    }

    // rate limiting logic
    checkRateLimit(user_email);

    // Query the database to find a matching user
    const sequelize = UserModel.sequelize;
    const [decryptedExpr] = decryptSensitiveData('user_email', pubkey);
    const user = await UserModel.findOne({
      attributes: ['user_id', [decryptedExpr, 'user_email'], 'user_password', 'org_id'],
      where: sequelize.where(decryptedExpr, user_email),
    });

    // Check if user exists
    if (!user || user.length === 0) {
      throw createError('User not found.', 404, {
        code: 'USER_NOT_FOUND',
      });
    }

    // Compare the decrypted password with the hashed password in the db
    const isPasswordValid = await bcrypt.compare(
      user_password,
      user.user_password
    );

    // check if password is valid
    if (!isPasswordValid) {
      throw createError('Invalid credentials.', 401, {
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Set token expiration based on "Remember Me" flag
    const tokenExpiry = rememberMe ? env.jwt.rememberMe : env.jwt.expires;

    // Generate JWT token if authentication is successful
    const token = jwt.sign({ id: user.user_id }, env.jwt.secret, {
      expiresIn: tokenExpiry,
    });

    // Encrypt the token and user details before sending them back
    const responsePayload = {
      token: encryptService(token),
      userId: encryptService(user.user_id),
      orgId: encryptService(user.org_id),
    };

    // validate encrypted payload structure
    if (!responsePayload.token || !responsePayload.userId) {
      throw createError('Invalid payload structure.', 400, {
        code: 'INVALID_PAYLOAD_STRUCTURE',
      });
    }

    // Encrypt the response payload
    const encryptedPayload = encryptService(responsePayload);

    // on successful login, reset the attempt count
    resetRateLimit(user_email);

    // Return success message along with the token and user details
    return {
      encryptedPayload,
    };
  } catch (error) {
    // Handle errors and log them for debugging
    logServiceError('orgAdminLoginService', error);
    throw createError(
      error.message || 'An error occurred during login.',
      error.status || 500,
      {
        code: error.code || 'LOGIN_SERVICE_ERROR',
      }
    );
  }
};
