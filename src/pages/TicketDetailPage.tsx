import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTicketDetail, useTicketHistory } from '../hooks/useTicketDetail';
import StatusBadge from '../components/ui/StatusBadge';
import CommentSection from '../components/tickets/CommentSection';
import AttachmentSection from '../components/tickets/AttachmentSection';
import TicketSidebar from '../components/tickets/TicketSidebar';
import Modal from '../components/ui/Modal';
import TicketForm from '../components/tickets/TicketForm';

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: ticket, isLoading } = useTicketDetail(id!);
  const { data: history = [] } = useTicketHistory(id!);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-1/3" />
        <div className="h-48 bg-gray-100 rounded-xl" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Chamado não encontrado.</p>
        <button onClick={() => navigate('/tickets')} className="mt-4 text-sm text-blue-600 underline">
          Voltar para chamados
        </button>
      </div>
    );
  }

  const ago = formatDistanceToNow(parseISO(ticket.createdAt), { addSuffix: true, locale: ptBR });

  return (
    <div className="space-y-4">
      {/* Navegação */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/tickets')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar para chamados
        </button>
        <button
          onClick={() => setIsEditOpen(true)}
          className="flex items-center gap-2 text-sm border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
        <Pencil size={13} />
          Editar
        </button>
      </div>

        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Editar Chamado">
          <TicketForm ticket={ticket} onSuccess={() => setIsEditOpen(false)} />
        </Modal>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
        {/* Coluna principal */}
        <div className="space-y-4">
          {/* Header do chamado */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="font-mono text-xs text-gray-400">#{ticket.id.slice(0, 8)}</span>
              <div className="flex gap-2">
                <StatusBadge status={ticket.status} />
                <StatusBadge priority={ticket.priority} />
              </div>
            </div>

            <h1 className="text-lg font-semibold text-gray-900 mb-3">{ticket.title}</h1>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{ticket.description}</p>

            <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
              <span>Solicitante: <strong className="text-gray-700">{ticket.createdBy.name} {ticket.createdBy.team?.name ? `(${ticket.createdBy.team.name})` : ''}</strong></span>
              <span>Categoria: <strong className="text-gray-700">{ticket.category}</strong></span>
              <span>Aberto: <strong className="text-gray-700">{ago}</strong></span>
            </div>
          </div>

          {/* Comentários */}
          <CommentSection ticketId={ticket.id} comments={ticket.comments} />

          {/* Anexos */}
          <AttachmentSection ticketId={ticket.id} attachments={ticket.attachments} />
        </div>

        {/* Sidebar */}
        <TicketSidebar ticket={ticket} history={history} />
      </div>
    </div>
  );
}