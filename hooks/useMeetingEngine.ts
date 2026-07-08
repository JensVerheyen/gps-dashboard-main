import { useRef, useState } from "react";

type Tracker = {
  name: string;
  position: [number, number];
};

type Hotspot = {
  location: string;
  stops: number;
  meetings: number;
};

type DetectMeetingParams = {
  tracker: Tracker;
  otherTrackers: Tracker[];
  newPosition: [number, number];
  calculateDistance: (a: [number, number], b: [number, number]) => number;
  setHotspots: React.Dispatch<React.SetStateAction<Hotspot[]>>;
};

const MEETING_THRESHOLD_SECONDS = 10;
const MEETING_DISTANCE = 0.005;

export function useMeetingEngine() {
  const [meetings, setMeetings] = useState<any[]>([]);

  const activeMeetingRef = useRef<Record<string, number>>({});
  const confirmedMeetingRef = useRef<Record<string, boolean>>({});
  const meetingEverConfirmedRef = useRef<Record<string, boolean>>({});

  function detectMeeting({
    tracker,
    otherTrackers,
    newPosition,
    calculateDistance,
    setHotspots,
  }: DetectMeetingParams) {
    otherTrackers.forEach((otherTracker) => {
      const names = [tracker.name, otherTracker.name].sort();
      const meetingKey = `${names[0]}-${names[1]}`;

      const meetingDistance = calculateDistance(
        newPosition,
        otherTracker.position
      );

      const isClose = meetingDistance < MEETING_DISTANCE;

      if (isClose) {
        if (!activeMeetingRef.current[meetingKey]) {
          activeMeetingRef.current[meetingKey] = Date.now();
        }

        const meetingSeconds =
          (Date.now() - activeMeetingRef.current[meetingKey]) / 1000;

        if (
          meetingSeconds >= MEETING_THRESHOLD_SECONDS &&
          !confirmedMeetingRef.current[meetingKey]
        ) {
          const meetingPosition = [
            (newPosition[0] + otherTracker.position[0]) / 2 + 0.001,
            (newPosition[1] + otherTracker.position[1]) / 2 + 0.001,
          ] as [number, number];

          const meetingLocation =
            otherTracker.name === "Charlie-03" || tracker.name === "Charlie-03"
              ? "Brussel"
              : "Gent";

          const meetingId = `${meetingKey}-${Date.now()}`;

          setMeetings((currentMeetings) => [
            {
              id: meetingId,
              pairKey: meetingKey,
              startTime: new Date(
                activeMeetingRef.current[meetingKey]
              ).toLocaleTimeString(),
              trackerA: names[0],
              trackerB: names[1],
              location: meetingLocation,
              position: meetingPosition,
              duration: 0,
              status: "Active",
              source: "Demo",
            },
            ...currentMeetings,
          ]);

          confirmedMeetingRef.current[meetingKey] = true;
          meetingEverConfirmedRef.current[meetingKey] = true;

          setHotspots((currentHotspots) => {
            const existing = currentHotspots.find(
              (spot) => spot.location === meetingLocation
            );

            if (existing) {
              return currentHotspots.map((spot) =>
                spot.location === meetingLocation
                  ? { ...spot, meetings: spot.meetings + 1 }
                  : spot
              );
            }

            return [
              ...currentHotspots,
              { location: meetingLocation, stops: 0, meetings: 1 },
            ];
          });
        }
      } else {
        delete activeMeetingRef.current[meetingKey];
        delete confirmedMeetingRef.current[meetingKey];

        setMeetings((currentMeetings) =>
          currentMeetings.map((meeting) =>
            meeting.pairKey === meetingKey && meeting.status === "Active"
              ? { ...meeting, status: "Ended" }
              : meeting
          )
        );
      }
    });
  }

  return {
    meetings,
    setMeetings,
    activeMeetingRef,
    confirmedMeetingRef,
    meetingEverConfirmedRef,
    detectMeeting,
  };
}