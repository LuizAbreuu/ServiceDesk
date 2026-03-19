import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { knowledgeService, type ArticleFilters, type ArticlePayload } from '../services/knowledgeService';
import toast from 'react-hot-toast';

export function useArticles(filters: ArticleFilters = {}) {
  return useQuery({
    queryKey: ['articles', filters],
    queryFn: () => knowledgeService.getAll(filters),
  });
}

export function useArticle(id: string) {
  return useQuery({
    queryKey: ['article', id],
    queryFn: () => knowledgeService.getById(id),
    enabled: !!id,
  });
}

export function useCreateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ArticlePayload) => knowledgeService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Artigo criado!');
    },
    onError: () => toast.error('Erro ao criar artigo.'),
  });
}

export function useUpdateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ArticlePayload> }) =>
      knowledgeService.update(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['articles'] });
      qc.invalidateQueries({ queryKey: ['article', id] });
      toast.success('Artigo salvo!');
    },
    onError: () => toast.error('Erro ao salvar artigo.'),
  });
}

export function useDeleteArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => knowledgeService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Artigo removido.');
    },
    onError: () => toast.error('Erro ao remover artigo.'),
  });
}