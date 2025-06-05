import { Router } from 'express';
import {
  updateUserController,
  getUserByEmailController,
  getUserByIdController,
  updateUserPasswordController,
} from '../controllers/index.js';
import { validatePayload } from '../middleware/index.js';

export const userRouter = Router();

// Update user
// This endpoint is used for both self-updates and admin-updates.
// userId and updatedBy must be sent in the encrypted payload.
userRouter.post('/update', validatePayload, updateUserController); // endpoint: /api/user/update

// Get user by email
userRouter.post('/get-by-email', validatePayload, getUserByEmailController); // endpoint: /api/user/get-by-email

// Get user by ID
userRouter.post('/get-by-id', validatePayload, getUserByIdController); // endpoint: /api/user/get-by-id

userRouter.post(
  '/update-password',
  validatePayload,
  updateUserPasswordController
); // endpoint: /api/user/update-password
