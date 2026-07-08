type TrackerListProps = {
  trackers: any[];
  selectedTrackerName: string;
  setSelectedTrackerName: (name: string) => void;
};

function getStatusDotColor(status: string) {
  if (status === "Online") return "bg-green-500";
  if (status === "Stop") return "bg-red-500";
  if (status === "Stilstaand") return "bg-orange-500";
  return "bg-slate-500";
}

export default function TrackerList({
  trackers,
  selectedTrackerName,
  setSelectedTrackerName,
}: TrackerListProps) {
  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
      <h3 className="text-2xl font-semibold mb-4">Trackers</h3>

      <div className="space-y-4">
        {trackers.filter(Boolean).map((tracker) => {
          const displayStatus =
            tracker.isLastKnown
              ? "Laatste gekende locatie"
              : tracker.stopDetected || tracker.status === "Stop"
              ? "Stop"
              : tracker.status;

          return (
            <div
              key={`${tracker.source}-${tracker.name}`}
              onClick={() => setSelectedTrackerName(tracker.name)}
              className={`bg-slate-800 rounded-lg p-4 border cursor-pointer hover:bg-slate-700 ${
                selectedTrackerName === tracker.name
                  ? "border-blue-500"
                  : "border-slate-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${getStatusDotColor(
                    displayStatus
                  )}`}
                />

                <div>
                  <div className="font-semibold text-lg">{tracker.name}</div>
                  <div className="text-xs text-slate-400">{tracker.source}</div>
                </div>
              </div>

              <div className="text-sm text-slate-300 mt-2">
                Status: {displayStatus}
              </div>

              {tracker.isLastKnown && (
                <div className="text-xs text-amber-300 mt-1">
                  GPS-signaal verloren — laatste geldige positie
                </div>
              )}

              <div className="text-sm text-slate-300">
                Snelheid: {tracker.speed} km/u
              </div>
              <div className="text-sm text-slate-300">
                Batterij: {tracker.battery}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}