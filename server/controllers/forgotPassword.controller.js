import { forgotPasswordService } from '../services/index.js';
import { messages } from '../messages/index.js';
import { response } from '../utils/index.js';

export const forgotPasswordController = async (req, res) => {
  const { payload } = req.body;

  try {
    await forgotPasswordService(payload);
    return response(res, {
      statusCode: 200,
      message: messages.general.EMAIL_SENT,
    });
  } catch (error) {
    console.error(
      'Forgot password controller error:',
      error.message,
      error.stack
    );

    return response(res, {
      statusCode: error.status || 500,
      message: error.message || messages.general.OOPS,
    });
  }
};
