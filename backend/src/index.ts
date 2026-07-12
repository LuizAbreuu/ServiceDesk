import "dotenv/config";
import "express-async-errors";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import path from "path";
import { Server } from "socket.io";
import { env, isOriginAllowed } from "./config/env";
import { authRoutes } from "./routes/authRoutes";
import { dashboardRoutes } from "./routes/dashboardRoutes";
import { knowledgeRoutes } from "./routes/knowledgeRoutes";
import { ticketRoutes } from "./routes/ticketRoutes";
import { userRoutes } from "./routes/userRoutes";
import { errorMiddleware } from "./middlewares/error";
import { createRateLimiter } from "./middlewares/rateLimit";
import { securityHeaders } from "./middlewares/security";
import { verifyAccessToken } from "./middlewares/auth";
import { prisma } from "./prisma";
import { UnauthorizedError } from "./utils/errors";

const app = express();
const httpServer = createServer(app);
const apiLimiter = createRateLimiter(env.apiRateLimitMax, env.apiRateLimitWindowMs);

export const io = new Server(httpServer, {
  cors: {
    origin: env.allowedOrigins,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  },
});

// Configs
app.disable("x-powered-by");
app.use(securityHeaders);
app.use(
  cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api", ticketRoutes);
app.use("/api", knowledgeRoutes);
app.use("/api", dashboardRoutes);

// Global Error Handler
app.use(errorMiddleware);

// Socket.IO Events

io.use(async (socket, next) => {
  try {
    const token = typeof socket.handshake.auth.token === "string"
      ? socket.handshake.auth.token
      : undefined;

    if (!token) {
      throw new UnauthorizedError("Socket token is missing");
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        teamId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError("Socket user is invalid");
    }

    socket.data.user = user;
    return next();
  } catch (error) {
    return next(error instanceof Error ? error : new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

httpServer.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});
