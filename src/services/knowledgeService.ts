import api from './api';
import type { Article } from '../types';

export interface ArticleFilters {
  search?:   string;
  category?: string;
  status?:   string;
}

export interface ArticlePayload {
  title:    string;
  excerpt:  string;
  content:  string;
  status:   string;
  category: string;
  tags:     string[];
}

export const knowledgeService = {
  async getAll(filters: ArticleFilters = {}): Promise<Article[]> {
    const { data } = await api.get('/knowledge', { params: filters });
    return data;
  },

  async getById(id: string): Promise<Article> {
    const { data } = await api.get(`/knowledge/${id}`);
    return data;
  },

  async create(payload: ArticlePayload): Promise<Article> {
    const { data } = await api.post('/knowledge', payload);
    return data;
  },

  async update(id: string, payload: Partial<ArticlePayload>): Promise<Article> {
    const { data } = await api.put(`/knowledge/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/knowledge/${id}`);
  },

  async vote(id: string, helpful: boolean): Promise<void> {
    await api.post(`/knowledge/${id}/vote`, { helpful });
  },
};