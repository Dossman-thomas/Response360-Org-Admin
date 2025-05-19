import { Router } from 'express';
import { getDashboardStatsController } from '../controllers/index.js';

export const statsRouter = Router();

statsRouter.get('/count', getDashboardStatsController); // endpoint: /api/stats/count