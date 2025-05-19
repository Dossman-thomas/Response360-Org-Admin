import { getUserByEmailService, getUserByIdService } from '../services/index.js';
import { response } from '../utils/index.js';
import { messages } from '../messages/index.js';

// Get User by Email
export const getUserByEmailController = async (req, res) => {
  const { payload } = req.body;

  try {
    const foundUser = await getUserByEmailService(payload);

    if (!foundUser) {
      return response(res, {
        statusCode: 404,
        message: messages.user.USER_NOT_FOUND,
      });
    }

    return response(res, {
      statusCode: 200,
      message: messages.general.SUCCESS,
      data: foundUser,
    });
  } catch (error) {
    console.error('Error in getUserByEmailController:', error);
    return response(res, {
      statusCode: error.status || 500,
      message: error.message || messages.general.INTERNAL_SERVER_ERROR,
    });
  }
};


// Get User by ID
export const getUserByIdController = async (req, res) => {
  const { payload } = req.body;

  try {
    const foundUser = await getUserByIdService(payload);

    if (!foundUser) {
      return response(res, {
        statusCode: 404,
        message: messages.user.USER_NOT_FOUND,
      });
    }

    return response(res, {
      statusCode: 200,
      message: messages.general.SUCCESS,
      data: foundUser,
    });
  } catch (error) {
    console.error('Error in getUserByIdController:', error);
    return response(res, {
      statusCode: error.status || 500,
      message: error.message || messages.general.INTERNAL_SERVER_ERROR,
    });
  }
}