import { Router } from 'express';
import { getAdminDashboardStatsController } from '../controllers/index.js';

export const AdminDashStatsRouter = Router();

AdminDashStatsRouter.get('/org-dash-counts', getAdminDashboardStatsController); // endpoint: /api/stats/org-dash-counts