import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, parseISO, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import StatusBadge from '../ui/StatusBadge';
import type { Ticket } from '../../types';

function SlaIndicator({ deadline }: { deadline: string }) {
  const hours = differenceInHours(parseISO(deadline), new Date());
  if (hours < 0) return <span className="text-xs text-red-600 font-medium">⚠ Vencido</span>;
  if (hours < 4) return <span className="text-xs text-red-500 font-medium">⚠ {hours}h restantes</span>;
  return <span className="text-xs text-green-600">✓ {hours}h restantes</span>;
}

function Avatar({ name, color }: { name: string; color: string }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

const AVATAR_COLORS = [
  'bg-purple-100 text-purple-700', 'bg-blue-100 text-blue-700',
  'bg-teal-100 text-teal-700',   'bg-orange-100 text-orange-700',
];

function avatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default function TicketRow({ ticket }: { ticket: Ticket }) {
  const navigate = useNavigate();
  const ago = formatDistanceToNow(parseISO(ticket.createdAt), { addSuffix: true, locale: ptBR });

  return (
    <tr
      className="hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => navigate(`/tickets/${ticket.id}`)}
    >
      <td className="px-4 py-3 font-mono text-xs text-gray-400">#{ticket.id.slice(0, 6)}</td>

      <td className="px-4 py-3 max-w-[200px]">
        <span className="text-sm text-gray-800 truncate block">{ticket.title}</span>
      </td>

      <td className="px-4 py-3">
        <StatusBadge status={ticket.status} />
      </td>

      <td className="px-4 py-3">
        <StatusBadge priority={ticket.priority} />
      </td>

      <td className="px-4 py-3 text-xs text-gray-500">{ticket.category}</td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Avatar name={ticket.createdBy.name} color={avatarColor(ticket.createdBy.name)} />
          <span className="text-xs text-gray-600 truncate max-w-[90px]">{ticket.createdBy.name}</span>
        </div>
      </td>

      <td className="px-4 py-3">
        {ticket.assignedTo ? (
          <div className="flex items-center gap-2">
            <Avatar name={ticket.assignedTo.name} color={avatarColor(ticket.assignedTo.name)} />
            <span className="text-xs text-gray-600 truncate max-w-[90px]">{ticket.assignedTo.name}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">— não atribuído</span>
        )}
      </td>

      <td className="px-4 py-3">
        <SlaIndicator deadline={ticket.slaDeadline} />
      </td>

      <td className="px-4 py-3 text-xs text-gray-400">{ago}</td>
    </tr>
  );
}