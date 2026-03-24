import api from './api';
import type { User } from '../types';

export interface Team {
  id: string;
  name: string;
  members: User[];
  openTickets: number;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role: string;
  teamId?: string;
  password: string;
}

export const userService = {
  async getAll(): Promise<User[]> {
    const { data } = await api.get('/users');
    return data;
  },

  async getById(id: string): Promise<User> {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  async create(payload: CreateUserPayload): Promise<User> {
    const { data } = await api.post('/users', payload);
    return data;
  },

  async update(id: string, payload: Partial<User>): Promise<User> {
    const { data } = await api.put(`/users/${id}`, payload);
    return data;
  },

  async deactivate(id: string): Promise<void> {
    await api.patch(`/users/${id}/deactivate`);
  },

  async reactivate(id: string): Promise<void> {
    await api.patch(`/users/${id}/reactivate`);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async getTeams(): Promise<Team[]> {
    const { data } = await api.get('/teams');
    return data;
  },

  async createTeam(name: string, memberIds: string[]): Promise<Team> {
    const { data } = await api.post('/teams', { name, memberIds });
    return data;
  },
};