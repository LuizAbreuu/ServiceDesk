import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { authMiddleware } from '../middlewares/auth';

const dashboardRoutes = Router();

dashboardRoutes.use(authMiddleware);
dashboardRoutes.get('/dashboard/metrics', dashboardController.getMetrics);

export { dashboardRoutes };
