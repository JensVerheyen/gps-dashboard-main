type LiveStatsPanelProps = {
  online: number;
  offline: number;
  activeStops: number;
  alerts: number;
};

export default function LiveStatsPanel({
  online,
  offline,
  activeStops,
  alerts,
}: LiveStatsPanelProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <StatCard title="Online" value={online} color="green" />
      <StatCard title="Offline" value={offline} color="red" />
      <StatCard title="Stops" value={activeStops} color="orange" />
      <StatCard title="Alerts" value={alerts} color="blue" />
    </div>
  );
}

type CardProps = {
  title: string;
  value: number;
  color: string;
};

function StatCard({ title, value, color }: CardProps) {
  return (
    <div className={`bg-slate-900 border border-${color}-700 rounded-xl p-5`}>
      <div className="text-slate-400 text-sm">{title}</div>

      <div className="text-4xl font-bold mt-2">
        {value}
      </div>
    </div>
  );
}