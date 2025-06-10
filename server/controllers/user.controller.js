import {
  createUserService,
  getAllUsersService,
  updateUserService,
  getUserByEmailService,
  getUserByIdService,
  deleteUserService,
} from '../services/index.js';
import { response } from '../utils/index.js';
import { messages } from '../messages/index.js';

// Create User
export const createUserController = async (req, res) => {
  // extract user data from the request body
  const { payload } = req.body;
  try {
    await createUserService(payload);
    return response(res, {
      statusCode: 201,
      message: messages.user.USER_CREATED,
    });
  } catch (error) {
    console.error('Error in createUserController:', error);
    return response(res, {
      statusCode: error.status || 500,
      message: error.message || messages.general.INTERNAL_SERVER_ERROR,
    });
  }
}

// get All Users
export const getAllUsersController = async (req, res) => {
  const { payload } = req.body;
  try {
    const users = await getAllUsersService(payload);
    if (!users || users.length === 0) {
      return response(res, {
        statusCode: 404,
        message: messages.user.NO_USERS_FOUND,
      });
    }
    return response(res, {
      statusCode: 200,
      message: messages.general.SUCCESS,
      data: users,
    });
  } catch (error) {
    console.error('Error in getAllUsersController:', error);
    return response(res, {
      statusCode: error.status || 500,
      message: error.message || messages.general.INTERNAL_SERVER_ERROR,
    });
  }
};

// Update User
export const updateUserController = async (req, res) => {
  // extract user ID and payload from the request body
  const { payload } = req.body;
  try {
    await updateUserService(payload);
    return response(res, {
      statusCode: 200,
      message: messages.user.USER_UPDATED,
    });
  } catch (error) {
    console.error('Error in updateUserController:', error);
    return response(res, {
      statusCode: error.status || 500,
      message: error.message || messages.general.INTERNAL_SERVER_ERROR,
    });
  }
};

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
};

// Delete User
export const deleteUserController = async (req, res) => {
  const { payload } = req.body;
  const { userId } = req.params;

  try {
    await deleteUserService(userId, payload);
    return response(res, {
      statusCode: 200,
      message: messages.user.USER_DELETED,
    });
  } catch (error) {
    console.error('Error in deleteUserController:', error);
    return response(res, {
      statusCode: error.status || 500,
      message: error.message || messages.general.INTERNAL_SERVER_ERROR,
    });
  }
};