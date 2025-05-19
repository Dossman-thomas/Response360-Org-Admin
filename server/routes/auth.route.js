import { Router } from 'express';
import {
  forgotPasswordController,
  passwordResetController,
  verifyPasswordController,
} from '../controllers/index.js';
import { validatePayload } from '../middleware/index.js';

export const authRouter = Router();

authRouter.post('/forgot-password', validatePayload, forgotPasswordController); // endpoint: /api/auth/forgot-password

authRouter.post('/reset-password', validatePayload, passwordResetController); // endpoint: /api/auth/reset-password

authRouter.post('/verify-password', validatePayload, verifyPasswordController); // endpoint: /api/auth/verify-password
