import { encryptService, decryptService } from '../services/index.js';
import { messages } from '../messages/index.js';
import { response } from '../utils/index.js';

// Encrypt Data
export const encryptController = (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return response(res, {
        status: 400,
        message: messages.general.DATA_NOT_FOUND,
      });
    }
    const encrypted = encryptService(data);

    return response(res, {
      statusCode: 200,
      message: messages.encryption.ENCRYPTION_SUCCESS,
      data: encrypted,
    });

  } catch (error) {
    console.error(error);
    return response(res, {
      statusCode: 500,
      message: messages.encryption.ENCRYPTION_FAILED,
      error: error.message,
    });
  }
};

// Decrypt Data
export const decryptController = (req, res) => {
  try {
    const { payload } = req.body;

    if (!payload) {
      return response(res, {
        status: 400,
        message: messages.encryption.ENCRYPTED_TEXT_MISSING,
      });
    }

    // Call the decryption service with the full encryptedText
    const decrypted = decryptService(payload);

    if (!decrypted) {
      return response(res, {
        status: 400,
        message: messages.encryption.DECRYPTION_FAILED,
      });
    }

    return response(res, {
      statusCode: 200,
      message: messages.encryption.DECRYPTION_SUCCESS,
      data: decrypted,
    });
  } catch (error) {
    console.error(error);
    return response(res, {
      statusCode: 500,
      message: messages.encryption.DECRYPTION_FAILED,
      error: error.message,
    });
  }
};
