import { getAdminDashboardStatsService } from '../services/index.js';
import { response } from '../utils/index.js';
import { messages } from '../messages/index.js';

export const getAdminDashboardStatsController = async (req, res) => {
  try {
    // Call the service with no parameters
    const encryptedStats = await getAdminDashboardStatsService();

    // Return successful response
    return response(res, {
      statusCode: 200,
      message: messages.general.SUCCESS,
      data: encryptedStats,
    });
  } catch (error) {
    console.error(error);
    return response(res, {
      statusCode: error.status || 500,
      message: error.message || messages.general.INTERNAL_SERVER_ERROR,
    });
  }
};
