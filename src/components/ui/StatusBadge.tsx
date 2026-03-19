import type { Priority, TicketStatus } from '../../types';

const PRIORITY_STYLES: Record<Priority, string> = {
  Low:      'bg-green-50 text-green-700',
  Medium:   'bg-yellow-50 text-yellow-700',
  High:     'bg-red-50 text-red-700',
  Critical: 'bg-red-100 text-red-900 font-semibold',
};

const STATUS_STYLES: Record<TicketStatus, string> = {
  Open:       'bg-blue-50 text-blue-700',
  InProgress: 'bg-yellow-50 text-yellow-700',
  Resolved:   'bg-green-50 text-green-700',
  Closed:     'bg-gray-100 text-gray-500',
};

export default function StatusBadge({ priority, status }: { priority?: Priority; status?: TicketStatus }) {
  if (priority) {
    return <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_STYLES[priority]}`}>{priority}</span>;
  }
  if (status) {
    return <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[status]}`}>{status}</span>;
  }
  return null;
}