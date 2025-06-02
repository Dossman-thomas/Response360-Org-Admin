import { Router } from 'express';
import { getAdminDashboardStatsController } from '../controllers/index.js';

export const AdminDashStatsRouter = Router();

statsRouter.get('/org-dash-counts', getAdminDashboardStatsController); // endpoint: /api/stats/org-dash-counts