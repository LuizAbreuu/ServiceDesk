import { Router } from "express";
import { dashboardController } from "../controllers/dashboardController";
import { authMiddleware } from "../middlewares/auth";
import { requireRole } from "../middlewares/authorize";

const dashboardRoutes = Router();

dashboardRoutes.use(authMiddleware);
dashboardRoutes.get("/dashboard/metrics", requireRole("Admin", "Manager", "Agent"), dashboardController.getMetrics);

export { dashboardRoutes };
