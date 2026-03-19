import { useCallback } from 'react';
import { Search } from 'lucide-react';
import type { TicketFilters } from '../../services/ticketService';

interface Props {
  filters: TicketFilters;
  onChange: (filters: TicketFilters) => void;
}

const STATUS_OPTIONS   = ['', 'Open', 'InProgress', 'Resolved', 'Closed'];
const PRIORITY_OPTIONS = ['', 'Low', 'Medium', 'High', 'Critical'];
const CATEGORY_OPTIONS = ['', 'Infraestrutura', 'Software', 'Hardware', 'Acesso / Senha', 'Outros'];

const STATUS_LABELS: Record<string, string> = {
  '': 'Todos os status', Open: 'Aberto', InProgress: 'Em andamento',
  Resolved: 'Resolvido', Closed: 'Fechado',
};
const PRIORITY_LABELS: Record<string, string> = {
  '': 'Todas as prioridades', Low: 'Baixa', Medium: 'Média',
  High: 'Alta', Critical: 'Crítica',
};

export default function TicketFiltersBar({ filters, onChange }: Props) {
  const set = useCallback(
    (key: keyof TicketFilters, value: string) =>
      onChange({ ...filters, [key]: value || undefined, page: 1 }),
    [filters, onChange]
  );

  return (
    <div className="flex gap-2 flex-wrap items-center mb-4">
      {/* Busca */}
      <div className="flex items-center gap-2 flex-1 min-w-[220px] bg-white border border-gray-200 rounded-lg px-3 py-2">
        <Search size={14} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar por título, #ID ou solicitante..."
          className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
          value={filters.search ?? ''}
          onChange={(e) => set('search', e.target.value)}
        />
      </div>

      {/* Status */}
      <select
        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none"
        value={filters.status ?? ''}
        onChange={(e) => set('status', e.target.value)}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>

      {/* Prioridade */}
      <select
        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none"
        value={filters.priority ?? ''}
        onChange={(e) => set('priority', e.target.value)}
      >
        {PRIORITY_OPTIONS.map((p) => (
          <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
        ))}
      </select>

      {/* Categoria */}
      <select
        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none"
        value={filters.category ?? ''}
        onChange={(e) => set('category', e.target.value)}
      >
        {CATEGORY_OPTIONS.map((c) => (
          <option key={c} value={c}>{c || 'Todas as categorias'}</option>
        ))}
      </select>
    </div>
  );
}