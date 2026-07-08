type Alert = {
  time: string;
  tracker: string;
  event: string;
  zone: string;
  source?: "Demo" | "Traccar";
};

type AlertsPanelProps = {
  alerts: Alert[];
};

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="bg-red-900/80 border border-red-700 rounded-xl p-6">
      <h3 className="text-2xl font-semibold mb-4">🔔 Alerts</h3>

      <div className="space-y-2">
        {alerts.map((alert, index) => (
          <div
            key={`${alert.time}-${alert.tracker}-${alert.event}-${index}`}
            className="grid grid-cols-5 gap-4 bg-red-950 rounded-lg p-4 text-sm"
          >
            <div>{alert.time}</div>
            <div>{alert.tracker}</div>
            <div>{alert.event}</div>
            <div>{alert.zone}</div>
            <div>{alert.source ?? "Demo"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}