import { Router } from 'express';
import {
  getUserByEmailController,
  getUserByIdController,
  updateUserPasswordController,
} from '../controllers/index.js';
import { validatePayload } from '../middleware/index.js';

export const userRouter = Router();

// Get user by email
userRouter.post('/get-by-email', validatePayload, getUserByEmailController); // endpoint: /api/user/get-by-email

// Get user by ID
userRouter.post('/get-by-id', validatePayload, getUserByIdController); // endpoint: /api/user/get-by-id

userRouter.post(
  '/update-password',
  validatePayload,
  updateUserPasswordController
); // endpoint: /api/user/update-password
