import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import type { DashboardMetrics, Ticket } from '../types';
import StatusBadge from '../components/ui/StatusBadge';
import MetricCard from '../components/ui/MetricCard';

export default function DashboardPage() {
  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => (await api.get('/dashboard/metrics')).data,
  });

  const { data: recentTickets } = useQuery<Ticket[]>({
    queryKey: ['recent-tickets'],
    queryFn: async () => (await api.get('/tickets?pageSize=5&sort=createdAt')).data.data,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Visão geral do service desk</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Chamados abertos" value={metrics?.openTickets ?? 0} trend="+8 hoje" trendUp />
        <MetricCard label="Resolvidos hoje" value={metrics?.resolvedToday ?? 0} trend="+12%" trendUp={false} />
        <MetricCard label="Tempo médio (h)" value={metrics?.avgResolutionTimeHours ?? 0} trend="-0.8h" trendUp={false} />
        <MetricCard label="SLA em risco" value={metrics?.slaAtRisk ?? 0} trend="Atenção" trendUp />
      </div>

      {/* Gráficos e tabela */}
      <div className="grid grid-cols-2 gap-4">
        {/* Chamados recentes */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold mb-3">Chamados recentes</h2>
          <div className="space-y-2">
            {recentTickets?.map((t) => (
              <div key={t.id} className="flex items-center gap-3 text-sm py-1 border-b border-gray-100 last:border-0">
                <span className="text-gray-400 font-mono text-xs">#{t.id.slice(0, 4)}</span>
                <span className="flex-1 truncate text-gray-700">{t.title}</span>
                <StatusBadge priority={t.priority} />
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico por categoria */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold mb-3">Volume por categoria</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={metrics?.ticketsByCategory ?? []}>
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#6c63ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}