import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService, type CreateUserPayload } from '../services/userService';
import toast from 'react-hot-toast';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  });
}

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: userService.getTeams,
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
    mutationFn: ({ id, payload }: { id: string; payload: Partial<{ name: string; role: string; teamId: string }> }) =>
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