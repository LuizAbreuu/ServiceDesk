import * as signalR from '@microsoft/signalr';

const HUB_URL = import.meta.env.VITE_HUB_URL ?? 'https://localhost:7001/hubs/notifications';

let connection: signalR.HubConnection | null = null;

export const signalrService = {
  async connect() {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => localStorage.getItem('accessToken') ?? '',
      })
      .withAutomaticReconnect()
      .build();

    await connection.start();
    console.log('SignalR conectado');
    return connection;
  },

  onTicketUpdated(callback: (ticket: unknown) => void) {
    connection?.on('TicketUpdated', callback);
  },

  onNewTicket(callback: (ticket: unknown) => void) {
    connection?.on('NewTicket', callback);
  },

  async disconnect() {
    await connection?.stop();
  },
};