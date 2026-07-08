export type LiveTracker = {
  name: string;
  position: [number, number];
  speed: number;
  status: string;
  stopDetected: boolean;
  source?: "Demo" | "Traccar";
  address?: string;
  location?: string;
  lastUpdate?: string;
};

export type LiveStop = {
  id: string;
  startTime: string;
  tracker: string;
  location: string;
  position: [number, number];
  duration: number;
  status: "Active" | "Ended";
  source: "Demo" | "Traccar";
};

export function detectLiveStops(
  trackers: (LiveTracker | null | undefined)[],
  currentStops: LiveStop[]
): LiveStop[] {
  const updatedStops = [...currentStops];

  trackers
    .filter((tracker): tracker is LiveTracker => Boolean(tracker))
    .filter((tracker) => tracker.source === "Traccar")
    .forEach((tracker) => {
      const isStopped = tracker.stopDetected || tracker.speed === 0;

      const activeStop = updatedStops.find(
        (stop) =>
          stop.tracker === tracker.name &&
          stop.status === "Active" &&
          stop.source === "Traccar"
      );

      if (isStopped) {
        if (activeStop) {
          activeStop.duration = tracker.lastUpdate
            ? Math.floor(
                (Date.now() - new Date(tracker.lastUpdate).getTime()) / 1000
              )
            : activeStop.duration + 5;

          activeStop.location = tracker.location ?? activeStop.location;
          activeStop.position = tracker.position;
        } else {
          updatedStops.unshift({
            id: `live-stop-${tracker.name}-${Date.now()}`,
            startTime: tracker.lastUpdate
              ? new Date(tracker.lastUpdate).toLocaleString()
              : new Date().toLocaleString(),
            tracker: tracker.name,
            location: tracker.location ?? "Onbekende locatie",
            position: tracker.position,
            duration: tracker.lastUpdate
              ? Math.floor(
                  (Date.now() - new Date(tracker.lastUpdate).getTime()) / 1000
                )
              : 0,
            status: "Active",
            source: "Traccar",
          });
        }
      } else if (activeStop) {
        activeStop.status = "Ended";
      }
    });

  return updatedStops;
}