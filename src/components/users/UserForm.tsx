import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateUser } from '../../hooks/useUsers';
import { useTeams } from '../../hooks/useUsers';

const schema = z.object({
  name:     z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email:    z.string().email('E-mail inválido'),
  role:     z.enum(['Admin', 'Manager', 'Agent', 'User']),
  teamId:   z.string().optional(),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
});

type FormData = z.infer<typeof schema>;

export default function UserForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate, isPending } = useCreateUser();
  const { data: teams = [] } = useTeams();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'User' },
  });

  const onSubmit = (data: FormData) => {
    mutate(data, { onSuccess });
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
        <input {...register('email')} type="email" placeholder="joao@empresa.com" className={inputClass} />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
      </div>

      {/* Perfil + Time */}
      <div className="grid grid-cols-2 gap-3">
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

      {/* Senha inicial */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Senha inicial *</label>
        <input
          {...register('password')}
          type="password"
          placeholder="Mínimo 8 caracteres"
          className={inputClass}
        />
        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        <p className="text-xs text-gray-400 mt-1">O usuário poderá alterar no primeiro acesso.</p>
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" onClick={onSuccess}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isPending}
          className="px-4 py-2 text-sm bg-[#1a1a2e] text-white rounded-lg hover:bg-[#2d2d4e] disabled:opacity-50 transition-colors">
          {isPending ? 'Criando...' : 'Criar Usuário'}
        </button>
      </div>
    </form>
  );
}