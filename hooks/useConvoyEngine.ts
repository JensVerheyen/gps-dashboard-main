import { useRef, useState } from "react";

type Tracker = {
  name: string;
  position: [number, number];
  status: string;
};

type DetectConvoyParams = {
  tracker: Tracker;
  otherTrackers: Tracker[];
  newPosition: [number, number];
  newStatus: string;
  newTargetIndex: number;
  calculateDistance: (
    a: [number, number],
    b: [number, number]
  ) => number;
  getLocationName: (
    tracker: string,
    targetIndex: number
  ) => string;
};

const CONVOY_THRESHOLD_SECONDS = 3;
const CONVOY_DISTANCE = 0.08;

export function useConvoyEngine() {
  const [convoys, setConvoys] = useState<any[]>([]);

  const activeConvoyRef = useRef<Record<string, number>>({});
  const confirmedConvoyRef = useRef<Record<string, boolean>>({});

  function detectConvoy({
    tracker,
    otherTrackers,
    newPosition,
    newStatus,
    newTargetIndex,
    calculateDistance,
    getLocationName,
  }: DetectConvoyParams) {
    otherTrackers.forEach((otherTracker) => {
      const names = [tracker.name, otherTracker.name].sort();
      const convoyKey = `${names[0]}-${names[1]}`;

      const convoyDistance = calculateDistance(
        newPosition,
        otherTracker.position
      );

      const isConvoy = convoyDistance < CONVOY_DISTANCE;

      if (isConvoy) {
        if (!activeConvoyRef.current[convoyKey]) {
          activeConvoyRef.current[convoyKey] = Date.now();
        }

        const convoySeconds =
          (Date.now() - activeConvoyRef.current[convoyKey]) / 1000;

        if (
          convoySeconds >= CONVOY_THRESHOLD_SECONDS &&
          !confirmedConvoyRef.current[convoyKey]
        ) {
          setConvoys((currentConvoys) => [
            {
              id: `${convoyKey}-${Date.now()}`,
              pairKey: convoyKey,
              startTime: new Date(
                activeConvoyRef.current[convoyKey]
              ).toLocaleTimeString(),
              trackerA: names[0],
              trackerB: names[1],
              duration: 0,
              status: "Active",
              lastLocation: getLocationName(
                tracker.name,
                newTargetIndex
              ),
              source: "Demo",
            },
            ...currentConvoys,
          ]);

          confirmedConvoyRef.current[convoyKey] = true;
        }
      } else {
        delete activeConvoyRef.current[convoyKey];

        if (confirmedConvoyRef.current[convoyKey]) {
          setConvoys((currentConvoys) =>
            currentConvoys.map((convoy) =>
              convoy.pairKey === convoyKey &&
              convoy.status === "Active"
                ? { ...convoy, status: "Ended" }
                : convoy
            )
          );

          delete confirmedConvoyRef.current[convoyKey];
        }
      }
    });
  }

  return {
    convoys,
    setConvoys,
    activeConvoyRef,
    confirmedConvoyRef,
    detectConvoy,
  };
}