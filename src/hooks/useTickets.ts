import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketService, type TicketFilters } from '../services/ticketService';
import type { Ticket } from '../types';
import toast from 'react-hot-toast';

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
    mutationFn: (payload: Partial<Ticket>) => ticketService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Chamado criado com sucesso!');
    },
    onError: () => toast.error('Erro ao criar chamado.'),
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Ticket> }) =>
      ticketService.update(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      qc.invalidateQueries({ queryKey: ['ticket', id] });
      toast.success('Chamado atualizado!');
    },
    onError: () => toast.error('Erro ao atualizar chamado.'),
  });
}