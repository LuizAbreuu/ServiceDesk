import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService, type CreateUserPayload } from '../services/userService';
import type { Role } from '../types';
import toast from 'react-hot-toast';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: userService.getTeams,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário criado com sucesso!');
    },
    onError: () => toast.error('Erro ao criar usuário.'),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<{ name: string; role: Role; teamId: string }> }) =>
      userService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário atualizado!');
    },
    onError: () => toast.error('Erro ao atualizar usuário.'),
  });
}

export function useToggleUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? userService.deactivate(id) : userService.reactivate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Status atualizado!');
    },
    onError: () => toast.error('Erro ao alterar status.'),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário excluído!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao excluir usuário.');
    },
  });
}