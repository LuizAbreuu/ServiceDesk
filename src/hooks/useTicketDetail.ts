import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ticketService } from '../services/ticketService';
import type { TicketStatus } from '../types';
import toast from 'react-hot-toast';

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
    onError: () => toast.error('Erro ao adicionar comentário.'),
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
    onError: () => toast.error('Erro ao atualizar status.'),
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
    onError: () => toast.error('Erro ao atribuir chamado.'),
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
    onError: () => toast.error('Erro ao anexar arquivo.'),
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
    onError: () => toast.error('Erro ao escalar prioridade.'),
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
    onError: () => toast.error('Erro ao excluir chamado.'),
  });
}