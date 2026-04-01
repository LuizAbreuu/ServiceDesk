import { Router } from 'express';
import { ticketController } from '../controllers/ticketController';
import { authMiddleware } from '../middlewares/auth';

const ticketRoutes = Router();

ticketRoutes.use(authMiddleware);

ticketRoutes.get('/tickets', ticketController.getAll);
ticketRoutes.get('/tickets/:id', ticketController.getById);
ticketRoutes.post('/tickets', ticketController.create);
ticketRoutes.patch('/tickets/:id/assign', ticketController.assign);
ticketRoutes.patch('/tickets/:id/status', ticketController.changeStatus);
ticketRoutes.patch('/tickets/:id/escalate', ticketController.escalate);
ticketRoutes.post('/tickets/:id/comments', ticketController.addComment);
ticketRoutes.get('/tickets/:id/history', ticketController.getHistory);
ticketRoutes.delete('/tickets/:id', ticketController.delete);

export { ticketRoutes };
