import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketService, type TicketCreatePayload, type TicketFilters, type TicketUpdatePayload } from '../services/ticketService';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../utils/apiError';

export function useTickets(filters: TicketFilters) {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => ticketService.getAll(filters),
    placeholderData: (prev) => prev,
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TicketCreatePayload) => ticketService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Chamado criado com sucesso!');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, {
      fallback: 'Não foi possível criar o chamado.',
      forbiddenMessage: 'Você não tem permissão para abrir chamados neste ambiente.',
      validationMessage: 'Revise os dados do chamado e tente novamente.',
    })),
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TicketUpdatePayload }) =>
      ticketService.update(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      qc.invalidateQueries({ queryKey: ['ticket', id] });
      toast.success('Chamado atualizado!');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, {
      fallback: 'Não foi possível atualizar o chamado.',
      forbiddenMessage: 'Você não tem permissão para editar este chamado.',
      notFoundMessage: 'Este chamado não está mais disponível para edição.',
      conflictMessage: 'O chamado mudou antes de salvar. Reabra a tela e tente novamente.',
      validationMessage: 'Revise os dados informados antes de salvar.',
    })),
  });
}
