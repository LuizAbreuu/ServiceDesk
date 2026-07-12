import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { knowledgeService, type ArticleFilters, type ArticlePayload } from '../services/knowledgeService';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../utils/apiError';

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
    onError: (error) => toast.error(getApiErrorMessage(error, {
      fallback: 'Não foi possível criar o artigo.',
      forbiddenMessage: 'Você não tem permissão para criar artigos.',
      validationMessage: 'Revise o conteúdo do artigo antes de salvar.',
    })),
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
    onError: (error) => toast.error(getApiErrorMessage(error, {
      fallback: 'Não foi possível salvar o artigo.',
      forbiddenMessage: 'Você não tem permissão para editar este artigo.',
      notFoundMessage: 'Este artigo não está mais disponível para edição.',
      conflictMessage: 'O artigo foi alterado em outra ação. Reabra e tente novamente.',
      validationMessage: 'Revise os campos obrigatórios antes de salvar.',
    })),
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
    onError: (error) => toast.error(getApiErrorMessage(error, {
      fallback: 'Não foi possível remover o artigo.',
      forbiddenMessage: 'Você não tem permissão para remover este artigo.',
      notFoundMessage: 'Este artigo já não existe mais.',
      conflictMessage: 'Não foi possível remover o artigo por causa do estado atual dele.',
    })),
  });
}
