import { getLocation } from "@/lib/locationEngine";
import { useEffect, useState } from "react";
import { mapTraccarToTrackers } from "@/lib/traccarEngine";
import { addHistoryPoint } from "@/lib/history/trackerHistory";

async function getLastValidPosition(deviceId: number) {
  const to = new Date();

  const from = new Date();
  from.setDate(from.getDate() - 14);

  const response = await fetch(
    `/api/traccar/history?deviceId=${deviceId}&from=${from.toISOString()}&to=${to.toISOString()}`
  );

  if (!response.ok) return null;

  const data = await response.json();

  return data.lastValidPosition;
}


async function getLastMovingTime(deviceId: number): Promise<string | null> {
  const to = new Date();

  const from = new Date();
  from.setDate(from.getDate() - 14);

  const response = await fetch(
    `/api/traccar/history?deviceId=${deviceId}&from=${from.toISOString()}&to=${to.toISOString()}`
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  return data.lastMovingTime ?? null;
}

export function useTraccar() {
  const [traccarTrackers, setTraccarTrackers] = useState<any[]>([]);

  useEffect(() => {
    async function loadTraccarTrackers() {
      try {
        const response = await fetch("/api/traccar");

        if (!response.ok) {
          throw new Error("Failed to fetch Traccar data");
        }

        const data = await response.json();

const mappedTrackers = mapTraccarToTrackers(
  data.devices,
  data.positions
);

const trackersWithAddress = await Promise.all(
  mappedTrackers.map(async (tracker: any) => {
const hasValidPosition =
  tracker.position[0] !== 0 &&
  tracker.position[1] !== 0;

if (hasValidPosition) {
  const address = await getLocation(
    tracker.position[0],
    tracker.position[1]
  );

addHistoryPoint(tracker.name, {
  timestamp: new Date().toISOString(),
  latitude: tracker.position[0],
  longitude: tracker.position[1],
  location: address,
  speed: tracker.speed,
  battery: tracker.battery,
});

const isStopped = tracker.stopDetected || tracker.speed === 0;

const realStopStartTime = isStopped
  ? await getLastMovingTime(tracker.deviceId)
  : null;

return {
  ...tracker,
  location: address,
  isLastKnown: false,
  lastKnownTime: null,
  lastUpdate: realStopStartTime ?? tracker.lastUpdate,
};

}

const lastValidPosition = await getLastValidPosition(tracker.deviceId);

if (lastValidPosition) {
  const address = await getLocation(
    lastValidPosition.latitude,
    lastValidPosition.longitude
  );

  return {
    ...tracker,
    position: [
      lastValidPosition.latitude,
      lastValidPosition.longitude,
    ],
    route: [[
      lastValidPosition.latitude,
      lastValidPosition.longitude,
    ]],
    location: address,
    isLastKnown: true,
    lastKnownTime:
      lastValidPosition.deviceTime ??
      lastValidPosition.fixTime ??
      lastValidPosition.serverTime,
    status: "Offline",
    speed: 0,
  };
}

return null;
  })
);

setTraccarTrackers(
  trackersWithAddress.filter((tracker) => tracker !== null)
);

      } catch (error) {
        console.error("Traccar sync failed:", error);
      }
    }

    loadTraccarTrackers();

    const interval = setInterval(loadTraccarTrackers, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    traccarTrackers,
  };
}