import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { errorMiddleware } from './middlewares/error';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configs
app.use(cors());
app.use(express.json());

// Routes
import { authRoutes } from './routes/authRoutes';
import { userRoutes } from './routes/userRoutes';
import { ticketRoutes } from './routes/ticketRoutes';
import { knowledgeRoutes } from './routes/knowledgeRoutes';
import { dashboardRoutes } from './routes/dashboardRoutes';

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', ticketRoutes);
app.use('/api', knowledgeRoutes);
app.use('/api', dashboardRoutes);

// Global Error Handler
app.use(errorMiddleware);

// Socket.IO
export const io = new Server(httpServer, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
