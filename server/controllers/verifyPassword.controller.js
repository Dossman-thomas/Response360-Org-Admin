import { verifyPasswordService } from '../services/index.js';
import { messages } from '../messages/index.js';
import { response } from '../utils/index.js';

export const verifyPasswordController = async (req, res) => {
  try {
    const { payload } = req.body;

    const result = await verifyPasswordService(payload);

    if (!result.success) {
      return response(res, {
        statusCode: 400,
        message: result.message || messages.general.BAD_REQUEST,
      });
    }

    return response(res, {
      statusCode: 200,
      success: true,
      message: messages.user.PASSWORD_VERIFIED,
    });
  } catch (error) {
    console.error('Error in verifyPasswordController:', error);
    return response(res, {
      statusCode: error.status || 500,
      success: false,
      message: error.message || messages.general.INTERNAL_SERVER_ERROR,
    });
  }
};
