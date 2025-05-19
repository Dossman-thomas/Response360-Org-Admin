// Description: Middleware to decrypt an encrypted ID from the request parameters
import { decryptService } from '../services/index.js';
import { messages } from '../messages/index.js';
import { response } from '../utils/index.js';

export const decryptOrgIdParam = async (req, res, next) => {
  try {
    let { encryptedOrgId } = req.params;

    if (!encryptedOrgId) {
      return response(res, {
        statusCode: 400,
        message: messages.encryption.MISSING_ENCRYPTED_ID,
      });
    }

    // Decode any URL-encoded characters like "%2F, %3D, %2B", etc.
    encryptedOrgId = decodeURIComponent(encryptedOrgId);

    const decryptedOrgId = await decryptService(encryptedOrgId);

    if (!decryptedOrgId) {
      // Decryption failed, send valid response with a proper status
      return response(res, {
        statusCode: 400,
        success: false,
        message: 'Invalid or malformed encrypted ID.',
      });
    }

    req.params.orgId = decryptedOrgId;

    next();
  } catch (err) {
    console.error(
      '❌ decryptOrgIdParam: Error decrypting organization ID.',
      err.message
    );
    return response(res, {
      statusCode: 400,
      error: messages.encryption.INVALID_ENCRYPTED_ID,
    });
  }
};
