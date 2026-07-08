import LiveStatsPanel from "./LiveStatsPanel";
import StopsPanel from "./StopsPanel";
import AlertsPanel from "./AlertsPanel";
import MapPanel from "./MapPanel";
import TrackerList from "./TrackerList";
import TrackerSourceFilter from "../Shared/TrackerSourceFilter";


type Props = {
  trackers: any[];
  selectedTracker: any;
  selectedTrackerName: string;
  setSelectedTrackerName: (name: string) => void;
  alerts: any[];
  allStops: any[];
  meetings: any[];
  formatDuration: (seconds: number) => string;
    trackerSourceFilter: "All" | "Demo" | "Traccar";
  setTrackerSourceFilter: (value: "All" | "Demo" | "Traccar") => void;
};

export default function LiveDashboard({
  trackers,
  selectedTracker,
  selectedTrackerName,
  setSelectedTrackerName,
  alerts,
  allStops,
  meetings,
  formatDuration,
trackerSourceFilter,
setTrackerSourceFilter,
}: 
Props) {
  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold">Live Tracking</h2>
<div className="flex items-center justify-between">
  <div className="text-sm text-slate-400">
    Weergave: {trackerSourceFilter}
  </div>

<TrackerSourceFilter
  value={trackerSourceFilter}
  onChange={setTrackerSourceFilter}
/>
</div>

      <LiveStatsPanel
        online={trackers.filter((t) => t.status === "Online").length}
        offline={trackers.filter((t) => t.status === "Offline").length}
        activeStops={allStops.filter((s) => s.status === "Active").length}
        alerts={alerts.length}
      />

      <StopsPanel stops={allStops} formatDuration={formatDuration} />

      <AlertsPanel alerts={alerts} />

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h3 className="text-2xl font-semibold mb-4">Live Kaart</h3>

          <MapPanel
            trackers={trackers}
            selectedTracker={selectedTracker}
            stops={allStops}
            meetings={meetings}
            
          />
        </div>

        <div className="col-span-2">
          <TrackerList
            trackers={trackers}
            selectedTrackerName={selectedTrackerName}
            setSelectedTrackerName={setSelectedTrackerName}
          />
        </div>
      </div>
    </div>
  );
}