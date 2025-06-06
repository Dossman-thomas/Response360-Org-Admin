import { Router } from 'express';
import { commonRouter } from './common.route.js';
import { authRouter } from './auth.route.js';
import { organizationRouter } from './organization.route.js';
import { collectionRouter } from './collection.route.js'
import { imageUploadRouter } from './imageUpload.route.js';
import { userRouter } from './user.route.js';
import { AdminDashStatsRouter } from './orgAdminDashStats.route.js';

export const routes = Router();

routes.use('/common', commonRouter); // add common routes

routes.use('/auth', authRouter); // add auth routes

routes.use('/organization', organizationRouter); // add organization routes

routes.use('/collection', collectionRouter); // add collection routes

routes.use('/image', imageUploadRouter); // add image upload routes

routes.use('/user', userRouter); // add user routes

routes.use('/stats', AdminDashStatsRouter); // add stats routes