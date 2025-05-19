import { passwordResetService } from '../services/index.js';
import { messages } from '../messages/index.js';
import { response } from '../utils/index.js';

export const passwordResetController = async (req, res) => {
  const { payload } = req.body;

  try {
    const result = await passwordResetService(payload);

    if (!result.success) {
      return response(res, {
        statusCode: 400,
        success: false,
        message: result.message,
      });
    }

    return response(res, {
      statusCode: 200,
      success: true,
      message: messages.general.SUCCESS,
    });
  } catch (error) {
    console.error('Password reset controller error:', error);
    return response(res, {
      statusCode: error.status || 500,
      success: false,
      message: error.message || messages.general.INTERNAL_SERVER_ERROR,
    });
  }
};
