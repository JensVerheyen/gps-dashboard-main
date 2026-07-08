import MapWrapper from "../MapWrapper";

type Props = {
  trackers: any[];
  selectedTracker: any;
  stops: any[];
  meetings: any[];
};

export default function MapPanel({
  trackers,
  selectedTracker,
  stops,
  meetings,
}: Props) {
  return (
    <div className="rounded-lg overflow-hidden">
      <MapWrapper
        trackers={trackers}
        selectedTracker={selectedTracker}
        stops={stops}
        meetings={meetings}
      />
    </div>
  );
}