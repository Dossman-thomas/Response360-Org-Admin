import { Router } from 'express';
import { getActiveCollectionsController } from '../controllers/index.js';
import { validatePayload } from '../middleware/index.js';

export const collectionRouter = Router();

collectionRouter.post('/read', validatePayload, getActiveCollectionsController); // endpoint: /api/collection/read
