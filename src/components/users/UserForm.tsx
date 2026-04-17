import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateUser, useUpdateUser, useTeams } from '../../hooks/useUsers';
import type { User } from '../../types';

const schema = z.object({
  name:     z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email:    z.string().email('E-mail inválido'),
  role:     z.enum(['Admin', 'Manager', 'Agent', 'User']),
  teamId:   z.string().optional(),
  password: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function UserForm({ onSuccess, initialData }: { onSuccess: () => void; initialData?: User }) {
  const { mutate: create, isPending: isCreating } = useCreateUser();
  const { mutate: update, isPending: isUpdating } = useUpdateUser();
  const { data: teams = [] } = useTeams();

  const isPending = isCreating || isUpdating;

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'User' },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        email: initialData.email,
        role: initialData.role,
        teamId: initialData.teamId || '',
        password: '',
      });
    }
  }, [initialData, reset]);

  const onSubmit = (data: FormData) => {
    if (!initialData && (!data.password || data.password.length < 8)) {
      setError('password', { message: 'Senha inicial deve ter ao menos 8 caracteres' });
      return;
    }
    
    // Convert teamId to undefined if it's empty string
    const payload: any = {
      ...data,
      teamId: data.teamId === "" ? undefined : data.teamId
    };
    
    // Remove empty password to avoid backend validation error
    if (!payload.password) {
      delete payload.password;
    }

    if (initialData) {
      update({ id: initialData.id, payload }, { onSuccess });
    } else {
      create(payload as any, { onSuccess });
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff]/20 transition-all";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Nome */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
        <input {...register('name')} placeholder="Ex: João Silva" className={inputClass} />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
      </div>

      {/* E-mail */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
        <input {...register('email')} type="email" disabled={!!initialData} placeholder="joao@empresa.com" className={`${inputClass} disabled:opacity-50`} />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
      </div>

      {/* Perfil + Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Perfil *</label>
          <select {...register('role')} className={inputClass}>
            <option value="User">Usuário</option>
            <option value="Agent">Agente</option>
            <option value="Manager">Gestor</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <select {...register('teamId')} className={inputClass}>
            <option value="">— sem time</option>
            {teams.map((t: { id: string; name: string }) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Senha */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{initialData ? 'Nova senha (Opcional)' : 'Senha inicial *'}</label>
        <input
          {...register('password')}
          type="password"
          placeholder="Mínimo 8 caracteres"
          className={inputClass}
        />
        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        {initialData && <p className="text-xs text-gray-400 mt-1">Preencha apenas se quiser alterar a senha.</p>}
        {!initialData && <p className="text-xs text-gray-400 mt-1">O usuário poderá alterar no primeiro acesso.</p>}
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" onClick={onSuccess}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isPending}
          className="px-4 py-2 text-sm bg-[#1a1a2e] text-white rounded-lg hover:bg-[#2d2d4e] disabled:opacity-50 transition-colors">
          {isPending ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Criar Usuário')}
        </button>
      </div>
    </form>
  );
}