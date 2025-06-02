import { CollectionModel } from '../database/models/index.js';
import { sequelize } from '../config/index.js';
import { env } from '../config/index.js';
import {
  pagination,
  encryptFields,
  decryptFields,
  decryptUserFields,
  generatePassword,
  createError,
} from '../utils/index.js';
import { encryptService, decryptService } from '../services/index.js';
import { v4 as uuidv4, validate as isUuid } from 'uuid';

const pubkey = env.encryption.pubkey;

// Validate pubkey
if (!pubkey) {
  createError('Public key is missing in the environment variables.', 500, {
    code: 'MISSING_PUBKEY',
  });
}

// Create Collection Service


// Read Collections Service
export const getActiveCollectionsService = async (payload) => {
  try {
    // Validate and decrypt payload
    if (!payload || typeof payload !== 'string') {
      throw createError('Invalid payload. Please provide valid data.', 400, {
        code: 'INVALID_PAYLOAD',
      });
    }

    const decryptedPayload = await decryptService(payload);
    if (!decryptedPayload || typeof decryptedPayload !== 'object') {
      throw createError('Decryption failed or missing data.', 400, {
        code: 'DECRYPTION_FAILED',
      });
    }

    const { org_id, page, limit } = decryptedPayload;

    if (!org_id) {
      throw createError('Missing organization ID.', 400, {
        code: 'MISSING_ORG_ID',
      });
    }

    // Find collections by org_id with active status
    const collectionsData = await CollectionModel.findAndCountAll({
      where: {
        org_id,
        collection_status: true,
      },
      attributes: ['collection_id', 'collection_name', 'updated_at'],
      order: [['updated_at', 'DESC']],
      ...pagination({ page, limit }),
    });

    // Encrypt the response
    const encrypted = await encryptService(collectionsData);
    if (!encrypted) {
      throw createError('Failed to encrypt collection data.', 500, {
        code: 'ENCRYPTION_FAILED',
      });
    }

    return encrypted;
  } catch (error) {
    console.error('Error in getActiveCollectionsService:', error);
    throw createError('Failed to retrieve active collections.', 500, {
      code: 'COLLECTION_RETRIEVAL_FAILED',
      log: true,
    });
  }
};

// Get Collection By ID Service


// Update Collection Service


// Delete Collection Service