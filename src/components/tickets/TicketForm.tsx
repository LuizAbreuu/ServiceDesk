import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useCreateTicket, useUpdateTicket } from '../../hooks/useTickets';
import type { Ticket } from '../../types';
import api from '../../services/api';

// Schema base para criação
const createSchema = z.object({
  title:       z.string().min(5,  'Mínimo 5 caracteres'),
  description: z.string().min(20, 'Mínimo 20 caracteres'),
  priority:    z.enum(['Low', 'Medium', 'High', 'Critical']),
  category:    z.string().min(1,  'Selecione uma categoria'),
});

// Schema para edição adiciona campos extras
const editSchema = createSchema.extend({
  status:      z.enum(['Open', 'InProgress', 'Resolved', 'Closed']),
  assignedToId:z.string().optional(),
  teamId:      z.string().optional(),
  slaDeadline: z.string().optional(),
});

type CreateFormData = z.infer<typeof createSchema>;
type EditFormData   = z.infer<typeof editSchema>;
type FormData = CreateFormData | EditFormData;

const CATEGORIES = ['Infraestrutura', 'Software', 'Hardware', 'Acesso / Senha', 'Outros'];

const STATUS_LABELS: Record<string, string> = {
  Open: 'Aberto', InProgress: 'Em andamento',
  Resolved: 'Resolvido', Closed: 'Fechado',
};

interface Props {
  ticket?: Ticket;       // se passado, modo edição
  onSuccess: () => void;
}

export default function TicketForm({ ticket, onSuccess }: Props) {
  const isEditing = !!ticket;

  const { mutate: create, isPending: isCreating } = useCreateTicket();
  const { mutate: update, isPending: isUpdating  } = useUpdateTicket();
  const isPending = isCreating || isUpdating;

  // Busca agentes disponíveis (apenas no modo edição)
  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => (await api.get('/users?role=Agent')).data,
    enabled: isEditing,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(isEditing ? editSchema : createSchema),
    defaultValues: isEditing
      ? {
          title:        ticket.title,
          description:  ticket.description,
          priority:     ticket.priority,
          category:     ticket.category,
          status:       ticket.status,
          assignedToId: ticket.assignedTo?.id ?? '',
          slaDeadline:  ticket.slaDeadline?.slice(0, 16), // formato datetime-local
        }
      : { priority: 'Medium' },
  });

  // Atualiza o form se o ticket mudar (ex: abrir edição de outro chamado)
  useEffect(() => {
    if (ticket) reset({
      title:        ticket.title,
      description:  ticket.description,
      priority:     ticket.priority,
      category:     ticket.category,
      status:       ticket.status,
      assignedToId: ticket.assignedTo?.id ?? '',
      slaDeadline:  ticket.slaDeadline?.slice(0, 16),
    });
  }, [ticket, reset]);

  const onSubmit = (data: FormData) => {
    if (isEditing) {
      update({ id: ticket.id, payload: data }, { onSuccess });
    } else {
      create(data, { onSuccess });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
        <input
          {...register('title')}
          placeholder="Descreva o problema brevemente"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff]/20 transition-all"
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Detalhe o problema, quando começou e qual o impacto..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff]/20 resize-none transition-all"
        />
        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
      </div>

      {/* Prioridade + Categoria */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade *</label>
          <select
            {...register('priority')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#6c63ff] transition-all"
          >
            <option value="Low">Baixa</option>
            <option value="Medium">Média</option>
            <option value="High">Alta</option>
            <option value="Critical">Crítica</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
          <select
            {...register('category')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#6c63ff] transition-all"
          >
            <option value="">Selecione...</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
        </div>
      </div>

      {/* Campos extras apenas na edição */}
      {isEditing && (
        <>
          {/* Status + Agente */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                {...register('status' as keyof FormData)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#6c63ff] transition-all"
              >
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agente responsável</label>
              <select
                {...register('assignedToId' as keyof FormData)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#6c63ff] transition-all"
              >
                <option value="">— não atribuído</option>
                {agents.map((a: { id: string; name: string }) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* SLA deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SLA Deadline</label>
            <input
              type="datetime-local"
              {...register('slaDeadline' as keyof FormData)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#6c63ff] transition-all"
            />
          </div>
        </>
      )}

      {/* Botões */}
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onSuccess}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm bg-[#1a1a2e] text-white rounded-lg hover:bg-[#2d2d4e] disabled:opacity-50 transition-colors"
        >
          {isPending
            ? (isEditing ? 'Salvando...' : 'Criando...')
            : (isEditing ? 'Salvar alterações' : 'Criar Chamado')
          }
        </button>
      </div>
    </form>
  );
}