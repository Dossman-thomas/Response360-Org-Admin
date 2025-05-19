import { Router } from 'express';
import { commonRouter } from './common.route.js';
import { authRouter } from './auth.route.js';
import { organizationRouter } from './organization.route.js';
import { imageUploadRouter } from './imageUpload.route.js';
import { userRouter } from './user.route.js';
import { statsRouter } from './stats.route.js';

export const routes = Router();

routes.use('/common', commonRouter); // add common routes

routes.use('/auth', authRouter); // add auth routes

routes.use('/organization', organizationRouter); // add organization routes

routes.use('/image', imageUploadRouter); // add image upload routes

routes.use('/user', userRouter); // add user routes

routes.use('/stats', statsRouter); // add stats routes