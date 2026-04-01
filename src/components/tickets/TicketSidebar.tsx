import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, ArrowUpRight, AlertTriangle, Trash2 } from 'lucide-react';
import { useChangeStatus, useAssignTicket, useEscalateTicket, useDeleteTicket } from '../../hooks/useTicketDetail';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';
import type { Ticket, TicketHistoryEntry } from '../../types';

function SlaStatus({ deadline }: { deadline: string }) {
  const hours = differenceInHours(parseISO(deadline), new Date());
  if (hours < 0) return <span className="text-red-600 font-medium text-xs">⚠ SLA vencido</span>;
  if (hours < 4) return <span className="text-red-500 text-xs">⚠ {hours}h restantes</span>;
  return <span className="text-green-600 text-xs">✓ {hours}h restantes</span>;
}

function TimelineItem({ entry }: { entry: TicketHistoryEntry }) {
  const COLOR_MAP: Record<string, string> = {
    created:  'bg-blue-400',
    assigned: 'bg-amber-400',
    status:   'bg-amber-400',
    escalated:'bg-red-500',
    resolved: 'bg-green-500',
    closed:   'bg-gray-400',
  };
  const color = COLOR_MAP[entry.action] ?? 'bg-gray-300';
  const time = format(parseISO(entry.createdAt), "dd/MM HH:mm", { locale: ptBR });

  return (
    <div className="flex gap-3 items-start">
      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${color}`} />
      <div>
        <p className="text-xs text-gray-600 leading-snug"
           dangerouslySetInnerHTML={{ __html: entry.description }} />
        <p className="text-xs text-gray-400 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

export default function TicketSidebar({
  ticket,
  history,
}: {
  ticket: Ticket;
  history: TicketHistoryEntry[];
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStandardUser = user?.role === 'User';
  const isAdmin = user?.role === 'Admin';

  const { mutate: changeStatus, isPending } = useChangeStatus(ticket.id);
  const { mutate: assign, isPending: isAssigning } = useAssignTicket(ticket.id);
  const { mutate: escalate, isPending: isEscalating } = useEscalateTicket(ticket.id);
  const { mutate: deleteTicket, isPending: isDeleting } = useDeleteTicket();
  const { data: users = [] } = useUsers();

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');

  const handleTransfer = () => {
    if (!selectedAgent) return;
    assign(selectedAgent, {
      onSuccess: () => {
        setIsTransferModalOpen(false);
        setSelectedAgent('');
      }
    });
  };

  const formattedSla = format(parseISO(ticket.slaDeadline), "dd/MM 'às' HH:mm");
  const formattedCreated = format(parseISO(ticket.createdAt), "dd/MM 'às' HH:mm");
  const formattedUpdated = format(parseISO(ticket.updatedAt), "dd/MM 'às' HH:mm");

  return (
    <div className="space-y-4">
      {/* Ações */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ações</h3>
        <div className="space-y-2">
          {!isStandardUser && ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
            <button
              disabled={isPending}
              onClick={() => changeStatus('Resolved')}
              className="w-full flex items-center justify-center gap-2 bg-[#1a1a2e] text-white text-sm py-2 rounded-lg hover:bg-[#2d2d4e] disabled:opacity-50 transition-colors"
            >
              <CheckCircle size={14} />
              Marcar como Resolvido
            </button>
          )}
          {ticket.status === 'Resolved' && (
            <button
              disabled={isPending}
              onClick={() => changeStatus('Closed')}
              className="w-full flex items-center justify-center gap-2 bg-gray-700 text-white text-sm py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              <CheckCircle size={14} />
              Fechar Chamado
            </button>
          )}

          {!isStandardUser && (
            <>
              <button 
                onClick={() => setIsTransferModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <ArrowUpRight size={14} />
                Transferir Chamado
              </button>
              <button 
                onClick={() => escalate()}
                disabled={isEscalating}
                className="w-full flex items-center justify-center gap-2 border border-orange-100 text-orange-600 text-sm py-2 rounded-lg hover:bg-orange-50 disabled:opacity-50 transition-colors">
                <AlertTriangle size={14} />
                Escalar Prioridade
              </button>
            </>
          )}

          {isAdmin && (
            <button
              onClick={() => {
                if (window.confirm('Tem certeza que deseja excluir este chamado? Esta ação não pode ser desfeita.')) {
                  deleteTicket(ticket.id, {
                    onSuccess: () => navigate('/tickets')
                  });
                }
              }}
              disabled={isDeleting}
              className="w-full flex items-center justify-center gap-2 border border-red-200 bg-red-50 text-red-600 text-sm py-2 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors mt-4">
              <Trash2 size={14} />
              Excluir Chamado
            </button>
          )}
        </div>
      </div>

      {/* Informações */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Informações</h3>
        <div className="space-y-2.5">
          {[
            { label: 'Agente',    value: ticket.assignedTo?.name ?? '— não atribuído' },
            { label: 'Time',      value: ticket.assignedTo?.teamId ?? '—' },
            { label: 'Criado em', value: formattedCreated },
            { label: 'Atualizado',value: formattedUpdated },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center text-xs border-b border-gray-50 pb-2 last:border-0">
              <span className="text-gray-500">{label}</span>
              <span className="text-gray-800 font-medium text-right max-w-[140px] truncate">{value}</span>
            </div>
          ))}
          <div className="flex justify-between items-center text-xs pt-1">
            <span className="text-gray-500">SLA deadline</span>
            <div className="text-right">
              <div className="text-gray-800 font-medium">{formattedSla}</div>
              <SlaStatus deadline={ticket.slaDeadline} />
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Histórico</h3>
        <div className="space-y-3">
          {history.map((entry) => (
            <TimelineItem key={entry.id} entry={entry} />
          ))}
          {history.length === 0 && (
            <p className="text-xs text-gray-400">Nenhum evento registrado.</p>
          )}
        </div>
      </div>

      <Modal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title="Transferir Chamado">
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selecione o Agente ou Administrador
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#6c63ff]"
            >
              <option value="">Selecione...</option>
              {users.filter(u => u.role !== 'User').map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.role})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => setIsTransferModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleTransfer}
              disabled={!selectedAgent || isAssigning}
              className="px-4 py-2 text-sm bg-[#6c63ff] text-white rounded-lg hover:bg-[#5b54e5] disabled:opacity-50 transition-colors"
            >
              {isAssigning ? 'Transferindo...' : 'Transferir'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}