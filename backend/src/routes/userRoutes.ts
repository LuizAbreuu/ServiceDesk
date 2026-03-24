import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authMiddleware } from '../middlewares/auth';

const userRoutes = Router();

userRoutes.use(authMiddleware);

// Users
userRoutes.get('/users', userController.getAll);
userRoutes.get('/users/:id', userController.getById);
userRoutes.post('/users', userController.create);
userRoutes.put('/users/:id', userController.update);
userRoutes.patch('/users/:id/deactivate', userController.deactivate);
userRoutes.patch('/users/:id/reactivate', userController.reactivate);
userRoutes.delete('/users/:id', userController.delete);
// Teams
userRoutes.get('/teams', userController.getTeams);
userRoutes.post('/teams', userController.createTeam);

export { userRoutes };
