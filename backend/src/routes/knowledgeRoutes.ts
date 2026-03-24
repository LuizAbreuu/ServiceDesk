import { Router } from 'express';
import { knowledgeController } from '../controllers/knowledgeController';
import { authMiddleware } from '../middlewares/auth';

const knowledgeRoutes = Router();

knowledgeRoutes.use(authMiddleware);

knowledgeRoutes.get('/knowledge', knowledgeController.getAll);
knowledgeRoutes.get('/knowledge/:id', knowledgeController.getById);
knowledgeRoutes.post('/knowledge', knowledgeController.create);
knowledgeRoutes.put('/knowledge/:id', knowledgeController.update);
knowledgeRoutes.delete('/knowledge/:id', knowledgeController.delete);
knowledgeRoutes.post('/knowledge/:id/vote', knowledgeController.vote);

export { knowledgeRoutes };
