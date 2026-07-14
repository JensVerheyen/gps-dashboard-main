import MapWrapper from "../MapWrapper";

type Props = {
  trackers: any[];
  selectedTracker: any;
  stops: any[];
  meetings: any[];
  onOpenDeviceCenter: (tracker: any) => void;
};

export default function MapPanel({
  trackers,
  selectedTracker,
  stops,
  meetings,
  onOpenDeviceCenter,
}: Props) {
  return (
    <div className="rounded-lg overflow-hidden">
      <MapWrapper
        trackers={trackers}
        selectedTracker={selectedTracker}
        stops={stops}
        meetings={meetings}
        onOpenDeviceCenter={onOpenDeviceCenter}
      />
    </div>
  );
}