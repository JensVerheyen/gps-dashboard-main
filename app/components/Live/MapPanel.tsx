import MapWrapper from "../MapWrapper";

type Props = {
  trackers: any[];
  selectedTracker: any;
  stops: any[];
  meetings: any[];
  onOpenDeviceCenter: (tracker: any) => void;
  followSelectedTracker: boolean;
setFollowSelectedTracker: (value: boolean) => void;
};

export default function MapPanel({
  trackers,
  selectedTracker,
  stops,
  meetings,
  onOpenDeviceCenter,
  followSelectedTracker,
  setFollowSelectedTracker,
}: Props) {
return (
  <div className="relative rounded-lg overflow-hidden">
    <MapWrapper
      trackers={trackers}
      selectedTracker={selectedTracker}
      stops={stops}
      meetings={meetings}
      onOpenDeviceCenter={onOpenDeviceCenter}
      followSelectedTracker={followSelectedTracker}
      setFollowSelectedTracker={setFollowSelectedTracker}
    />

<div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-slate-950/90 px-3 py-2 text-xs font-semibold text-emerald-300 shadow-lg">
    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
    LIVE
  </div>

  <button
          onClick={() => setFollowSelectedTracker(!followSelectedTracker)}
        className={`px-3 py-2 rounded-lg text-sm font-semibold shadow-lg border transition ${
          followSelectedTracker
            ? "bg-blue-600 border-blue-400 text-white"
            : "bg-slate-900/90 border-slate-700 text-slate-300"
        }`}
      >
        {followSelectedTracker ? "📍 Following" : "📍 Follow"}
      </button>
    </div>
  </div>
);
}