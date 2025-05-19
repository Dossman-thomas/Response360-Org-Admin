import { loginSuperAdminService } from '../services/index.js';
import { messages } from '../messages/index.js';
import { response } from '../utils/index.js';

export const loginSuperAdminController = async (req, res) => {
  const { payload } = req.body;

  try {
    // Authenticate super admin
    const user = await loginSuperAdminService(payload);

    // Send success response with the encrypted token
    return response(res, {
      statusCode: 200,
      message: messages.auth.SIGNIN_SUCCESS,
      data: user.encryptedPayload,
    });
  } catch (error) {
    console.error(
      'Error in loginSuperAdminController:',
      error.message,
      error.stack
    );

    return response(res, {
      statusCode: error.status || 500,
      message: error.message || messages.general.INTERNAL_SERVER_ERROR,
    });
  }
};
