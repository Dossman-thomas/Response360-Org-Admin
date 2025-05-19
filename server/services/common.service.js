import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { logServiceError, createError } from '../utils/index.js';
import { env } from '../config/index.js'; 

const pubkey = env.encryption.pubkey; 

// Validate pubkey
if (!pubkey) {
  createError('Public key is missing in the environment variables.', 500, {
    code: 'MISSING_PUBKEY',
  });
}

const parsedPubKey = CryptoJS.SHA256(pubkey); // Parse key to always produce a 256-bit (32-bytes) key

// Function to generate random IV
const generateIV = () => CryptoJS.lib.WordArray.random(16);

// Encrypt function
export const encryptService = (data) => {
  try {
    if (!data || typeof data !== 'object' && typeof data !== 'string') {
      throw createError('Invalid data. Please provide a valid object or string.', 400, {
        code: 'INVALID_DATA',
      });
    }

    const uuid = uuidv4().replace(/-/g, ''); // Generate UUID and remove dashes

    const iv = generateIV(); // Generate IV only once

    // First level encryption
    const firstEncrypt = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      CryptoJS.enc.Utf8.parse(uuid),
      { iv: iv }
    ).toString();

    const combined = `${uuid}###${firstEncrypt}`;

    // Second level encryption
    const finalEncrypt = CryptoJS.AES.encrypt(combined, parsedPubKey, {
      iv: iv,
    }).toString();

    // Combine final encryption with IV
    const encryptedString = `${finalEncrypt}:${CryptoJS.enc.Base64.stringify(
      iv
    )}`;

    // Return encrypted text
    return encryptedString;
  } catch (error) {
    logServiceError('encryptService', error);
    throw createError(`Encryption failed: ${error.message}`, 500, {
      code: 'ENCRYPTION_FAILED',
    });
  }
};

export const decryptService = (payload) => {
  try {
    if (!payload || typeof payload !== 'string') {
      throw createError('Invalid payload. Please provide a valid string.', 400, {
        code: 'INVALID_PAYLOAD',
      });
    }

    const [encryptedPayload, ivBase64] = payload.split(':');

    if (!ivBase64) {
      throw createError('Invalid payload format. IV is missing.', 400, {
        code: 'INVALID_PAYLOAD_FORMAT',
      });
    }

    const iv = CryptoJS.enc.Base64.parse(ivBase64);

    // First decryption
    const firstDecryption = CryptoJS.AES.decrypt(
      encryptedPayload,
      parsedPubKey,
      {
        iv,
      }
    ).toString(CryptoJS.enc.Utf8);

    if (!firstDecryption) {
      throw createError('Decryption failed. Invalid payload.', 400, {
        code: 'DECRYPTION_FAILED',
      });
    }

    if (!firstDecryption.includes('###')) {
      console.error(
        '❌ decryptService: Malformed decrypted data — delimiter not found.'
      );
      throw createError('Malformed decrypted data.', 400, {
        code: 'MALFORMED_DATA',
      });
    }

    const [uuid, firstEncryptedData] = firstDecryption.split('###');
    const firstKey = CryptoJS.enc.Utf8.parse(uuid);

    // Second decryption
    const finalDecryption = CryptoJS.AES.decrypt(firstEncryptedData, firstKey, {
      iv,
    }).toString(CryptoJS.enc.Utf8);

    return JSON.parse(finalDecryption);
  } catch (error) {
    logServiceError('decryptService', error);
    throw createError(`Decryption failed: ${error.message}`, 500, {
      code: 'DECRYPTION_FAILED',
    });
  }
};
