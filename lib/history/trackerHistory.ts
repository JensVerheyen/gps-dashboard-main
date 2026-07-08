export type TrackerHistoryPoint = {
  timestamp: string;
  latitude: number;
  longitude: number;
  location: string;
  speed: number;
  battery: number;
};

const history = new Map<string, TrackerHistoryPoint[]>();

export function addHistoryPoint(
  trackerName: string,
  point: TrackerHistoryPoint
) {
  if (!history.has(trackerName)) {
    history.set(trackerName, []);
  }

  history.get(trackerName)!.push(point);
}

export function getTrackerHistory(trackerName: string) {
  return history.get(trackerName) ?? [];
}

export function getAllHistory() {
  return history;
}