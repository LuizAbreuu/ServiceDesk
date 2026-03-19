import api from './api';
import type { AuthTokens, User } from '../types';

interface LoginPayload { email: string; password: string; }

export const authService = {
  async login(payload: LoginPayload): Promise<{ tokens: AuthTokens; user: User }> {
    const { data } = await api.post('/auth/login', payload);
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await api.get('/auth/me');
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.clear();
  },
};