interface Props {
  label: string;
  value: number;
  trend: string;
  trendUp: boolean;
}

export default function MetricCard({ label, value, trend, trendUp }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className={`text-xs mt-1 ${trendUp ? 'text-red-500' : 'text-green-600'}`}>{trend}</p>
    </div>
  );
}