import { Router } from "express";
import multer from "multer";
import path from "path";
import { ticketController } from "../controllers/ticketController";
import { authMiddleware } from "../middlewares/auth";
import { requireRole } from "../middlewares/authorize";

const ticketRoutes = Router();
const upload = multer({
  dest: path.resolve(process.cwd(), "uploads"),
  limits: { fileSize: 10 * 1024 * 1024 },
});

ticketRoutes.use(authMiddleware);

ticketRoutes.get("/tickets", ticketController.getAll);
ticketRoutes.get("/tickets/:id", ticketController.getById);
ticketRoutes.post("/tickets", ticketController.create);
ticketRoutes.put("/tickets/:id", requireRole("Admin", "Manager", "Agent"), ticketController.update);
ticketRoutes.patch("/tickets/:id/assign", requireRole("Admin", "Manager", "Agent"), ticketController.assign);
ticketRoutes.patch("/tickets/:id/status", requireRole("Admin", "Manager", "Agent"), ticketController.changeStatus);
ticketRoutes.patch("/tickets/:id/escalate", requireRole("Admin", "Manager", "Agent"), ticketController.escalate);
ticketRoutes.post("/tickets/:id/comments", ticketController.addComment);
ticketRoutes.post("/tickets/:id/attachments", upload.single("file"), ticketController.addAttachment);
ticketRoutes.get("/tickets/:id/history", ticketController.getHistory);
ticketRoutes.delete("/tickets/:id", requireRole("Admin"), ticketController.delete);

export { ticketRoutes };
