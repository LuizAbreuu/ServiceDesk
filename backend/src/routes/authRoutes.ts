import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';

const authRoutes = Router();

authRoutes.post('/login', authController.login);
authRoutes.post('/logout', authController.logout);
authRoutes.get('/me', authMiddleware, authController.me);

export { authRoutes };
