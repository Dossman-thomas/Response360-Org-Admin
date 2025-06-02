import { UserModel, CollectionModel } from '../database/models/index.js';
import { encryptService } from './index.js';
import { createError } from '../utils/index.js';

export const getAdminDashboardStatsService = async () => {
  try {
    // Count users by role_id
    const dataManagerCount = await UserModel.count({
      where: { role_id: 3 },
    });

    const flingerCount = await UserModel.count({
      where: { role_id: 4 },
    });

    // Count total number of collections in table
    const collectionCount = await CollectionModel.count();

    // Validate counts
    if (
      typeof dataManagerCount !== 'number' ||
      typeof flingerCount !== 'number' ||
      typeof collectionCount !== 'number'
    ) {
      throw createError('Invalid count data retrieved from database', 500, {
        code: 'INVALID_STATS_DATA',
      });
    }

    const payload = {
      dataManagerCount,
      flingerCount,
      collectionCount,
    };

    const encryptedPayload = await encryptService(payload);

    if (!encryptedPayload) {
      throw createError('Failed to encrypt dashboard stats', 500, {
        code: 'ENCRYPTION_FAILED',
      });
    }

    return encryptedPayload;
  } catch (error) {
    console.error('Error in getDashboardStatsService:', error);
    throw createError('Failed to retrieve dashboard statistics', 500, {
      code: 'DASHBOARD_STATS_SERVICE_FAILURE'
    });
  }
};
