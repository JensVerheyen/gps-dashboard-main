"use client";

import dynamic from "next/dynamic";

type Tracker = {
  name: string;
  position: [number, number];
  route: [number, number][];
  speed: number;
  battery: number;
  status: string;
  stationarySince: number | null;
  stopDetected: boolean;
};

type Stop = {
  startTime: string;
  tracker: string;
  location: string;
  position: [number, number];
  duration: number;
};
type Meeting = {
  id: string;
  startTime: string;
  trackerA: string;
  trackerB: string;
  location: string;
  position: [number, number];
  duration: number;
  status: "Active" | "Ended";
};

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

export default function MapWrapper({
  trackers,
  selectedTracker,
  stops = [],
  meetings = [],
}: {
  trackers: Tracker[];
  selectedTracker: Tracker;
  stops?: Stop[];
  meetings?: Meeting[];
}) {  return (
    <Map
      trackers={trackers}
      selectedTracker={selectedTracker}
      stops={stops}
      meetings={meetings}
    />
  );
}