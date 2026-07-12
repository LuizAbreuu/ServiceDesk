import { Router } from "express";
import { knowledgeController } from "../controllers/knowledgeController";
import { authMiddleware } from "../middlewares/auth";
import { requireRole } from "../middlewares/authorize";

const knowledgeRoutes = Router();

knowledgeRoutes.use(authMiddleware);

knowledgeRoutes.get("/knowledge", knowledgeController.getAll);
knowledgeRoutes.get("/knowledge/:id", knowledgeController.getById);
knowledgeRoutes.post("/knowledge", requireRole("Admin", "Manager", "Agent"), knowledgeController.create);
knowledgeRoutes.put("/knowledge/:id", requireRole("Admin", "Manager", "Agent"), knowledgeController.update);
knowledgeRoutes.delete("/knowledge/:id", requireRole("Admin", "Manager"), knowledgeController.delete);
knowledgeRoutes.post("/knowledge/:id/vote", knowledgeController.vote);

export { knowledgeRoutes };
