import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ticketService } from '../services/ticketService';
import type { TicketStatus } from '../types';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../utils/apiError';

export function useTicketDetail(id: string) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketService.getById(id),
    enabled: !!id,
    refetchInterval: 30_000, // refresca a cada 30s
  });
}

export function useTicketHistory(id: string) {
  return useQuery({
    queryKey: ['ticket-history', id],
    queryFn: () => ticketService.getHistory(id),
    enabled: !!id,
  });
}

export function useAddComment(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ content, isInternal }: { content: string; isInternal: boolean }) =>
      ticketService.addComment(ticketId, content, isInternal),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket', ticketId] });
      toast.success('Comentário adicionado!');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, {
      fallback: 'Não foi possível adicionar o comentário.',
      forbiddenMessage: 'Você não tem permissão para comentar neste chamado.',
      notFoundMessage: 'Este chamado não está mais disponível para novos comentários.',
      validationMessage: 'Escreva um comentário válido antes de enviar.',
    })),
  });
}

export function useChangeStatus(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: TicketStatus) => ticketService.changeStatus(ticketId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket', ticketId] });
      qc.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Status atualizado!');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, {
      fallback: 'Não foi possível atualizar o status do chamado.',
      forbiddenMessage: 'Você não tem permissão para alterar o status deste chamado.',
      notFoundMessage: 'Este chamado não foi encontrado para atualização de status.',
      conflictMessage: 'O status do chamado foi alterado em outra ação. Atualize a página e tente novamente.',
    })),
  });
}

export function useAssignTicket(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (agentId: string) => ticketService.assign(ticketId, agentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket', ticketId] });
      toast.success('Chamado atribuído!');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, {
      fallback: 'Não foi possível atribuir o chamado.',
      forbiddenMessage: 'Você não tem permissão para atribuir este chamado.',
      notFoundMessage: 'O chamado ou o agente selecionado não está mais disponível.',
      conflictMessage: 'A atribuição não pôde ser concluída com o estado atual do chamado.',
    })),
  });
}

export function useUploadAttachment(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => ticketService.uploadAttachment(ticketId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket', ticketId] });
      toast.success('Arquivo anexado!');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, {
      fallback: 'Não foi possível anexar o arquivo.',
      forbiddenMessage: 'Você não tem permissão para anexar arquivos neste chamado.',
      notFoundMessage: 'Este chamado não está mais disponível para receber anexos.',
      conflictMessage: 'O arquivo não pôde ser anexado agora. Tente novamente em instantes.',
      validationMessage: 'O arquivo enviado é inválido ou excede os limites aceitos.',
    })),
  });
}

export function useEscalateTicket(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => ticketService.escalate(ticketId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket', ticketId] });
      qc.invalidateQueries({ queryKey: ['ticket-history', ticketId] });
      toast.success('Prioridade escalada com sucesso!');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, {
      fallback: 'Não foi possível escalar a prioridade do chamado.',
      forbiddenMessage: 'Você não tem permissão para escalar este chamado.',
      notFoundMessage: 'Este chamado não foi encontrado para escalonamento.',
      conflictMessage: 'A prioridade já foi alterada recentemente. Atualize a página e tente novamente.',
    })),
  });
}

export function useDeleteTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: string) => ticketService.delete(ticketId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Chamado excluído com sucesso!');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, {
      fallback: 'Não foi possível excluir o chamado.',
      forbiddenMessage: 'Você não tem permissão para excluir este chamado.',
      notFoundMessage: 'Este chamado já não existe mais.',
      conflictMessage: 'Não foi possível excluir o chamado por causa do estado atual dele.',
    })),
  });
}
