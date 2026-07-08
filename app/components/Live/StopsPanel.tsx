type Stop = {
  id: string;
  startTime: string;
  tracker: string;
  location: string;
  position: [number, number];
  duration: number;
  status: "Active" | "Ended";
  source: "Demo" | "Traccar";
};

type StopsPanelProps = {
  stops: Stop[];
  formatDuration: (seconds: number) => string;
};

export default function StopsPanel({ stops, formatDuration }: StopsPanelProps) {
  if (stops.length === 0) return null;

  return (
    <div className="bg-orange-900/80 border border-orange-700 rounded-xl p-6">
      <h3 className="text-2xl font-semibold mb-4">🛑 Stops</h3>

      <div className="space-y-2">
        {stops.map((stop) => (
          <div
            key={stop.id}
            className="grid grid-cols-6 gap-4 bg-orange-950 rounded-lg p-4 text-sm"
          >
            <div>{stop.startTime}</div>
            <div>{stop.tracker}</div>
            <div>{stop.location}</div>
            <div>{stop.status}</div>
            <div>{formatDuration(stop.duration)}</div>
            <div>{stop.source}</div>
          </div>
        ))}
      </div>
    </div>
  );
}