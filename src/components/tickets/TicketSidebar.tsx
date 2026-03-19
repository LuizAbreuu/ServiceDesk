import { format, parseISO, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { useChangeStatus } from '../../hooks/useTicketDetail';
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
  const { mutate: changeStatus, isPending } = useChangeStatus(ticket.id);
  const formattedSla = format(parseISO(ticket.slaDeadline), "dd/MM 'às' HH:mm");
  const formattedCreated = format(parseISO(ticket.createdAt), "dd/MM 'às' HH:mm");
  const formattedUpdated = format(parseISO(ticket.updatedAt), "dd/MM 'às' HH:mm");

  return (
    <div className="space-y-4">
      {/* Ações */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ações</h3>
        <div className="space-y-2">
          {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
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
          <button className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <ArrowUpRight size={14} />
            Transferir Chamado
          </button>
          <button className="w-full flex items-center justify-center gap-2 border border-red-100 text-red-600 text-sm py-2 rounded-lg hover:bg-red-50 transition-colors">
            <AlertTriangle size={14} />
            Escalar Prioridade
          </button>
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
    </div>
  );
}