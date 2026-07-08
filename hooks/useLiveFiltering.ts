type SourceFilter = "All" | "Demo" | "Traccar";

type UseLiveFilteringProps = {
  trackers: any[];
  allStops: any[];
  alerts: any[];
  meetings: any[];
  selectedTrackerName: string;
  trackerSourceFilter: SourceFilter;
};

export function useLiveFiltering({
  trackers,
  allStops,
  alerts,
  meetings,
  selectedTrackerName,
  trackerSourceFilter,
}: UseLiveFilteringProps) {
  const filteredTrackers =
    trackerSourceFilter === "All"
      ? trackers
      : trackers.filter((tracker) => tracker.source === trackerSourceFilter);

  const filteredStops =
    trackerSourceFilter === "All"
      ? allStops
      : allStops.filter((stop) => stop.source === trackerSourceFilter);

  const filteredAlerts =
    trackerSourceFilter === "All"
      ? alerts
      : alerts.filter((alert) => alert.source === trackerSourceFilter);

  const filteredMeetings =
    trackerSourceFilter === "All"
      ? meetings
      : meetings.filter((meeting) => meeting.source === trackerSourceFilter);

  const selectedTracker =
    filteredTrackers.find((tracker) => tracker.name === selectedTrackerName) ??
    filteredTrackers[0] ??
    trackers[0];

  return {
    filteredTrackers,
    filteredStops,
    filteredAlerts,
    filteredMeetings,
    selectedTracker,
  };
}