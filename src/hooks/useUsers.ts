import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService, type CreateUserPayload } from '../services/userService';
import type { Role } from '../types';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../utils/apiError';

export function useUsers(filters: { role?: Role } = {}) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.getAll(filters),
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
    onError: (error) => toast.error(getApiErrorMessage(error, {
      fallback: 'Não foi possível criar o usuário.',
      forbiddenMessage: 'Você não tem permissão para criar este tipo de usuário.',
      conflictMessage: 'Já existe um usuário com estes dados.',
      validationMessage: 'Revise os dados do usuário antes de salvar.',
    })),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<{ name: string; role: Role; teamId: string; password: string }> }) =>
      userService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário atualizado!');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, {
      fallback: 'Não foi possível atualizar o usuário.',
      forbiddenMessage: 'Você não tem permissão para editar este usuário.',
      notFoundMessage: 'Este usuário não está mais disponível para edição.',
      conflictMessage: 'Os dados do usuário entraram em conflito com outro cadastro.',
      validationMessage: 'Revise os dados informados antes de salvar.',
    })),
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
    onError: (error) => toast.error(getApiErrorMessage(error, {
      fallback: 'Não foi possível alterar o status do usuário.',
      forbiddenMessage: 'Você não tem permissão para alterar o status deste usuário.',
      notFoundMessage: 'Este usuário não foi encontrado.',
      conflictMessage: 'O status do usuário mudou antes da confirmação. Atualize a lista e tente novamente.',
    })),
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
    onError: (error) => toast.error(getApiErrorMessage(error, {
      fallback: 'Não foi possível excluir o usuário.',
      forbiddenMessage: 'Você não tem permissão para excluir este usuário.',
      notFoundMessage: 'Este usuário já não existe mais.',
      conflictMessage: 'Não foi possível excluir o usuário por causa do estado atual do cadastro.',
    })),
  });
}
