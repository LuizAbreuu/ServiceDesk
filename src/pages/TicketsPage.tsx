import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTickets } from '../hooks/useTickets';
import TicketFiltersBar from '../components/tickets/TicketFilters';
import TicketRow from '../components/tickets/TicketRow';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import TicketForm from '../components/tickets/TicketForm';
import type { TicketFilters } from '../services/ticketService';

export default function TicketsPage() {
  const [filters, setFilters] = useState<TicketFilters>({ page: 1, pageSize: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isFetching } = useTickets(filters);

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Chamados</h1>
          <p className="text-sm text-gray-500">
            {data?.total ?? 0} chamados encontrados
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#1a1a2e] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#2d2d4e] transition-colors w-full sm:w-auto justify-center"
        >
          <Plus size={16} />
          Novo Chamado
        </button>
      </div>

      {/* Filtros */}
      <TicketFiltersBar filters={filters} onChange={setFilters} />

      {/* Tabela */}
      <div className={`bg-white rounded-xl border border-gray-200 overflow-x-auto transition-opacity ${isFetching ? 'opacity-70' : ''}`}>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['#ID', 'Título', 'Status', 'Prioridade', 'Categoria',
                'Solicitante', 'Agente', 'SLA', 'Aberto em'].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : data?.data.map((ticket) => (
                  <TicketRow key={ticket.id} ticket={ticket} />
                ))
            }
          </tbody>
        </table>

        {!isLoading && data?.data.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-400">
            Nenhum chamado encontrado para os filtros selecionados.
          </div>
        )}
      </div>

      {/* Paginação */}
      <Pagination
        page={filters.page ?? 1}
        pageSize={filters.pageSize ?? 10}
        total={data?.total ?? 0}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
      />

      {/* Modal de novo chamado */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Chamado">
        <TicketForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}