import { Router } from "express";
import { userController } from "../controllers/userController";
import { authMiddleware } from "../middlewares/auth";
import { requireRole } from "../middlewares/authorize";

const userRoutes = Router();

userRoutes.use(authMiddleware);

// Users
userRoutes.get("/users", requireRole("Admin", "Manager", "Agent"), userController.getAll);
userRoutes.get("/users/:id", requireRole("Admin", "Manager", "Agent"), userController.getById);
userRoutes.post("/users", requireRole("Admin", "Manager"), userController.create);
userRoutes.put("/users/:id", requireRole("Admin", "Manager"), userController.update);
userRoutes.patch("/users/:id/deactivate", requireRole("Admin", "Manager"), userController.deactivate);
userRoutes.patch("/users/:id/reactivate", requireRole("Admin", "Manager"), userController.reactivate);
userRoutes.delete("/users/:id", requireRole("Admin"), userController.delete);
// Teams
userRoutes.get("/teams", requireRole("Admin", "Manager", "Agent"), userController.getTeams);
userRoutes.post("/teams", requireRole("Admin", "Manager"), userController.createTeam);

export { userRoutes };
