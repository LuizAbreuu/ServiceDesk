import { Router } from "express";
import { authController } from "../controllers/authController";
import { env } from "../config/env";
import { authMiddleware } from "../middlewares/auth";
import { createRateLimiter } from "../middlewares/rateLimit";

const authRoutes = Router();
const authLimiter = createRateLimiter(env.authRateLimitMax, env.authRateLimitWindowMs);

authRoutes.post("/login", authLimiter, authController.login);
authRoutes.post("/register", authLimiter, authController.register);
authRoutes.post("/logout", authMiddleware, authController.logout);
authRoutes.get("/me", authMiddleware, authController.me);

export { authRoutes };
