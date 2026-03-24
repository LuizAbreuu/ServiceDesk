import { io, Socket } from 'socket.io-client';

const HUB_URL = import.meta.env.VITE_HUB_URL ?? 'http://localhost:3000';

let connection: Socket | null = null;

export const signalrService = {
  async connect() {
    connection = io(HUB_URL, {
      auth: {
        token: localStorage.getItem('accessToken') ?? ''
      }
    });

    connection.on('connect', () => {
      console.log('Socket.IO conectado');
    });

    return connection;
  },

  onTicketUpdated(callback: (ticket: unknown) => void) {
    connection?.on('TicketUpdated', callback);
  },

  onNewTicket(callback: (ticket: unknown) => void) {
    connection?.on('NewTicket', callback);
  },

  async disconnect() {
    connection?.disconnect();
  },
};