import { OrganizationModel, UserModel } from '../database/models/index.js';
import { encryptService } from './index.js';
import { createError } from '../utils/index.js';

export const getDashboardStatsService = async () => {
  try {
    const orgCount = await OrganizationModel.count();
    const userCount = await UserModel.count();

    // Validate the counts
    if (typeof orgCount !== 'number' || typeof userCount !== 'number') {
      throw createError('Invalid count data retrieved from database', 500, {
        code: 'INVALID_STATS_DATA',
      });
    }

    const payload = {
      orgCount,
      userCount,
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
