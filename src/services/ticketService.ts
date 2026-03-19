import api from './api';
import type { Ticket } from '../types';

export interface TicketFilters {
  category: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const ticketService = {
  async getAll(filters: TicketFilters = {}): Promise<PagedResult<Ticket>> {
    const { data } = await api.get('/tickets', { params: filters });
    return data;
  },

  async getById(id: string): Promise<Ticket> {
    const { data } = await api.get(`/tickets/${id}`);
    return data;
  },

  async create(payload: Partial<Ticket>): Promise<Ticket> {
    const { data } = await api.post('/tickets', payload);
    return data;
  },

  async update(id: string, payload: Partial<Ticket>): Promise<Ticket> {
    const { data } = await api.put(`/tickets/${id}`, payload);
    return data;
  },

  async addComment(ticketId: string, content: string, isInternal: boolean): Promise<void> {
    await api.post(`/tickets/${ticketId}/comments`, { content, isInternal });
  },

  async uploadAttachment(ticketId: string, file: File): Promise<void> {
    const form = new FormData();
    form.append('file', file);
    await api.post(`/tickets/${ticketId}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  // Adicione dentro do objeto ticketService:

  async getHistory(ticketId: string): Promise<TicketHistoryEntry[]> {
  const { data } = await api.get(`/tickets/${ticketId}/history`);
  return data;
  },

  async assign(ticketId: string, agentId: string): Promise<void> {
  await api.patch(`/tickets/${ticketId}/assign`, { agentId });
  },

  async changeStatus(ticketId: string, status: TicketStatus): Promise<void> {
  await api.patch(`/tickets/${ticketId}/status`, { status });
  },

  async escalate(ticketId: string): Promise<void> {
  await api.patch(`/tickets/${ticketId}/escalate`);
  },
};