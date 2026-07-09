"use client";
import { useConvoyEngine } from "../hooks/useConvoyEngine";
import { useLiveFiltering } from "../hooks/useLiveFiltering";
import TrackerSourceFilter from "./components/Shared/TrackerSourceFilter";
import MapPanel from "./components/Live/MapPanel";
import LiveStatsPanel from "./components/Live/LiveStatsPanel";
import StopsPanel from "./components/Live/StopsPanel";
import AlertsPanel from "./components/Live/AlertsPanel";
import LiveDashboard from "./components/Live/LiveDashboard";
import TrackerList from "./components/Live/TrackerList";
import TripsView from "./components/TripsView";
import { useTrips } from "@/hooks/useTrips";
import { useEffect, useMemo, useRef, useState } from "react";
import MapWrapper from "./components/MapWrapper";
import { useStopEngine } from "../hooks/useStopEngine";
import { useMeetingEngine } from "../hooks/useMeetingEngine";
import { useAlertEngine } from "../hooks/useAlertEngine";
import { useTrackingProvider } from "../hooks/useTrackingProvider";
import DeviceCenter from "./DeviceCenter/DeviceCenter";

type Source = "Demo" | "Traccar";

type Tracker = {
  name: string;
  position: [number, number];
  route: [number, number][];
  speed: number;
  battery: number;
  status: "Online" | "Stilstaand" | "Offline" | "Stop";
  stationarySince: number | null;
  stopDetected: boolean;
  targetIndex: number;
  source: Source;
  address?: string;
  isLastKnown?: boolean;
lastUpdate?: string;
lastKnownTime?: string | null;
deviceId?: number;
};

type Alert = {
  time: string;
  tracker: string;
  event: string;
  zone: string;
  source: Source;
};

type Stop = {
  id: string;
  startTime: string;
  tracker: string;
  location: string;
  position: [number, number];
  duration: number;
  status: "Active" | "Ended";
  source: Source;
};

type Meeting = {
  id: string;
  pairKey: string;
  startTime: string;
  trackerA: string;
  trackerB: string;
  location: string;
  position: [number, number];
  duration: number;
  status: "Active" | "Ended";
  source: Source;
};

type Convoy = {
  id: string;
  pairKey: string;
  startTime: string;
  trackerA: string;
  trackerB: string;
  duration: number;
  status: "Active" | "Ended";
  lastLocation: string;
  source: Source;
};

type NetworkItem = {
  pair: string;
  count: number;
};

type Hotspot = {
  location: string;
  stops: number;
  meetings: number;
};

type TimelineEvent = {
  id: string;
  time: string;
  tracker?: string;
  type: "Geofence" | "Stop" | "Meeting" | "Convoy";
  location: string;
  severity: "High" | "Medium" | "Low";
  title: string;
  color: string;
  source: Source;
};

function formatDuration(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) {
    return `${days}d ${hours}u ${minutes}m ${secs}s`;
  }

  if (hours > 0) {
    return `${hours}u ${minutes}m ${secs}s`;
  }

  return `${minutes}m ${secs}s`;
}
function formatDistance(meters: number) {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }

  return `${Math.round(meters)} m`;
}
const calculateDistance = (pos1: [number, number], pos2: [number, number]) => {
  const latDiff = pos1[0] - pos2[0];
  const lngDiff = pos1[1] - pos2[1];
  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
};

const getLocationName = (trackerName: string, targetIndex: number) => {
  if (trackerName === "Alpha-01" && targetIndex === 1) return "Brussel";
  if (trackerName === "Bravo-02") return "Brussel";
  if (trackerName === "Charlie-03") return "Brussel";
  return "Gent";
};

export default function Dashboard() {
  const [demoTrackers, setDemoTrackers] = useState<Tracker[]>([
    {
      name: "Alpha-01",
      position: [51.2194, 4.4025],
      route: [[51.2194, 4.4025]],
      speed: 72,
      battery: 84,
      status: "Online",
      stationarySince: null,
      stopDetected: false,
      targetIndex: 0,
      source: "Demo",
    },
    {
      name: "Bravo-02",
      position: [51.0543, 3.7174],
      route: [[51.0543, 3.7174]],
      speed: 0,
      battery: 67,
      status: "Stilstaand",
      stationarySince: Date.now(),
      stopDetected: false,
      targetIndex: 0,
      source: "Demo",
    },
    {
      name: "Charlie-03",
      position: [50.8503, 4.3517],
      route: [[50.8503, 4.3517]],
      speed: 0,
      battery: 41,
      status: "Stop",
      stationarySince: Date.now(),
      stopDetected: true,
      targetIndex: 0,
      source: "Demo",
    },
  ]);

const {
    trackers,
    traccarTrackers,
} = useTrackingProvider(demoTrackers);

const [trackerSourceFilter, setTrackerSourceFilter] = useState<
  "All" | "Demo" | "Traccar"
>("Traccar");

const { alerts, setAlerts } = useAlertEngine();
const {
    stops,
    setStops,
    liveStops,
    setLiveStops,
    allStops,
} = useStopEngine(traccarTrackers);

const {
  meetings,
  setMeetings,
  activeMeetingRef,
  confirmedMeetingRef,
  meetingEverConfirmedRef,
  detectMeeting,
} = useMeetingEngine();

const {
  convoys,
  setConvoys,
  activeConvoyRef,
  confirmedConvoyRef,
  detectConvoy,
} = useConvoyEngine();

const [network, setNetwork] = useState<NetworkItem[]>([]);
const [hotspots, setHotspots] = useState<Hotspot[]>([]);

const [selectedTrackerName, setSelectedTrackerName] = useState("Grace");

const [activeTab, setActiveTab] = useState<
"live" | "analyse" | "timeline" | "trips" | "devices"
>("live");

const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

const [timelineFilter, setTimelineFilter] = useState<
  "All" | "Geofence" | "Stop" | "Meeting" | "Convoy"
>("All");

const [timelineTrackerFilter, setTimelineTrackerFilter] =
  useState<string>("All");

const [timelineLocationFilter, setTimelineLocationFilter] =
  useState<string>("All");

const [timelineSeverityFilter, setTimelineSeverityFilter] = useState<
  "All" | "High" | "Medium" | "Low"
>("All");

const [timelineView, setTimelineView] = useState<"table" | "vertical">("table");

const [selectedTimelineEvent, setSelectedTimelineEvent] =
  useState<TimelineEvent | null>(null);

const insideZonesRef = useRef<Record<string, boolean>>({});
const stopCreatedRef = useRef<Record<string, boolean>>({});


const {
  filteredTrackers,
  filteredStops,
  filteredAlerts,
  filteredMeetings,
  selectedTracker,
} = useLiveFiltering({
  trackers,
  allStops,
  alerts,
  meetings,
  selectedTrackerName,
  trackerSourceFilter,
});
  
  const trips = useTrips(12102);

  useEffect(() => {
    const interval = setInterval(() => {
      setDemoTrackers((current) =>
        current.map((tracker) => {
          const STOP_THRESHOLD_SECONDS = 10;
          const MOVE_AFTER_STOP_SECONDS = 13;
          const MEETING_THRESHOLD_SECONDS = 10;
          const MEETING_DISTANCE = 0.005;
          const stepSize = 0.01;

          if (tracker.name !== "Alpha-01" && tracker.name !== "Bravo-02") {
            return tracker;
          }

          const alpha = current.find((t) => t.name === "Alpha-01");

          const waypoints =
            tracker.name === "Alpha-01"
              ? ([[51.0543, 3.7174], [50.8503, 4.3517]] as [number, number][])
              : ([[50.8503, 4.3517]] as [number, number][]);

          const currentTargetIndex = tracker.targetIndex ?? 0;
          const targetPosition =
            waypoints[currentTargetIndex] ?? waypoints[waypoints.length - 1];

          const distanceToTarget = calculateDistance(tracker.position, targetPosition);

          const alphaBravoMeetingDone =
            meetingEverConfirmedRef.current["Alpha-01-Bravo-02"] === true;

          const bravoCanMove =
            tracker.name !== "Bravo-02" ||
            (alphaBravoMeetingDone && !!alpha && alpha.targetIndex > 0 && alpha.status !== "Stop");

          let newPosition = tracker.position;
          let newStatus: Tracker["status"] = tracker.status;
          let newSpeed = tracker.speed;
          let newStationarySince = tracker.stationarySince;
          let newStopDetected = tracker.stopDetected;
          let newTargetIndex = currentTargetIndex;

          if (distanceToTarget > stepSize && bravoCanMove) {
            const latDiff = targetPosition[0] - tracker.position[0];
            const lngDiff = targetPosition[1] - tracker.position[1];

            newPosition = [
              tracker.position[0] + (latDiff / distanceToTarget) * stepSize,
              tracker.position[1] + (lngDiff / distanceToTarget) * stepSize,
            ];

            newSpeed = tracker.name === "Bravo-02" ? 60 : 72;
            newStatus = "Online";
            newStationarySince = null;
            newStopDetected = false;

            setStops((currentStops) =>
              currentStops.map((stop) =>
                stop.tracker === tracker.name && stop.status === "Active"
                  ? { ...stop, status: "Ended" }
                  : stop
              )
            );
          } else if (distanceToTarget <= stepSize) {
            newPosition = targetPosition;
            newSpeed = 0;

            if (!newStationarySince) newStationarySince = Date.now();

            const stoppedSeconds = (Date.now() - newStationarySince) / 1000;

            if (stoppedSeconds >= STOP_THRESHOLD_SECONDS) {
              newStatus = "Stop";
              const stopKey = `${tracker.name}-${currentTargetIndex}`;

              if (!stopCreatedRef.current[stopKey]) {
                const hotspotLocation = getLocationName(tracker.name, currentTargetIndex);

                setHotspots((currentHotspots) => {
                  const existing = currentHotspots.find(
                    (spot) => spot.location === hotspotLocation
                  );

                  if (existing) {
                    return currentHotspots.map((spot) =>
                      spot.location === hotspotLocation
                        ? { ...spot, stops: spot.stops + 1 }
                        : spot
                    );
                  }

                  return [
                    ...currentHotspots,
                    { location: hotspotLocation, stops: 1, meetings: 0 },
                  ];
                });

                setStops((currentStops) => [
                  {
                    id: stopKey,
                    startTime: new Date().toLocaleTimeString(),
                    tracker: tracker.name,
                    location: hotspotLocation,
                    position: newPosition,
                    duration: 0,
                    status: "Active",
                    source: "Demo",
                  },
                  ...currentStops,
                ]);

                stopCreatedRef.current[stopKey] = true;
              }

              if (
                stoppedSeconds >= MOVE_AFTER_STOP_SECONDS &&
                currentTargetIndex < waypoints.length - 1
              ) {
                newTargetIndex = currentTargetIndex + 1;
                newStatus = "Online";
                newSpeed = tracker.name === "Bravo-02" ? 60 : 72;
                newStationarySince = null;
                newStopDetected = false;

                setStops((currentStops) =>
                  currentStops.map((stop) =>
                    stop.tracker === tracker.name && stop.status === "Active"
                      ? { ...stop, status: "Ended" }
                      : stop
                  )
                );
              } else {
                newStopDetected = true;
              }
            } else {
              newStatus = "Stilstaand";
            }
          } else {
            newPosition = tracker.position;
            newSpeed = 0;

            if (!newStationarySince) newStationarySince = Date.now();

            const stoppedSeconds = (Date.now() - newStationarySince) / 1000;

            if (stoppedSeconds >= STOP_THRESHOLD_SECONDS) {
              newStatus = "Stop";
              const stopKey = `${tracker.name}-${currentTargetIndex}`;

              if (!stopCreatedRef.current[stopKey]) {
                const hotspotLocation = getLocationName(tracker.name, currentTargetIndex);

                setHotspots((currentHotspots) => {
                  const existing = currentHotspots.find(
                    (spot) => spot.location === hotspotLocation
                  );

                  if (existing) {
                    return currentHotspots.map((spot) =>
                      spot.location === hotspotLocation
                        ? { ...spot, stops: spot.stops + 1 }
                        : spot
                    );
                  }

                  return [
                    ...currentHotspots,
                    { location: hotspotLocation, stops: 1, meetings: 0 },
                  ];
                });

                setStops((currentStops) => [
                  {
                    id: stopKey,
                    startTime: new Date().toLocaleTimeString(),
                    tracker: tracker.name,
                    location: hotspotLocation,
                    position: newPosition,
                    duration: 0,
                    status: "Active",
                    source: "Demo",
                  },
                  ...currentStops,
                ]);

                stopCreatedRef.current[stopKey] = true;
              }

              newStopDetected = true;
            } else {
              newStatus = "Stilstaand";
            }
          }

          if (tracker.name === "Alpha-01") {
            const antwerpPosition = [51.2194, 4.4025] as [number, number];
            const distanceFromAntwerp = calculateDistance(newPosition, antwerpPosition);
            const isInsideAntwerp = distanceFromAntwerp < 0.05;
            const zoneKey = `${tracker.name}-Antwerp Zone`;
            const wasInside = insideZonesRef.current[zoneKey];

            if (wasInside === undefined) {
              insideZonesRef.current[zoneKey] = isInsideAntwerp;
            } else if (isInsideAntwerp !== wasInside) {
              const event = isInsideAntwerp ? "Entered" : "Exited";

              setAlerts((currentAlerts) => {
                const alreadyExists = currentAlerts.some(
                  (alert) =>
                    alert.tracker === tracker.name &&
                    alert.event === event &&
                    alert.zone === "Antwerp Zone"
                );

                if (alreadyExists) return currentAlerts;

                return [
                  {
                    time: new Date().toLocaleTimeString(),
                    tracker: tracker.name,
                    event,
                    zone: "Antwerp Zone",
                    source: "Demo",
                  },
                  ...currentAlerts,
                ];
              });

              insideZonesRef.current[zoneKey] = isInsideAntwerp;
            }
          }

          const otherTrackers = current.filter(
            (otherTracker) => otherTracker.name !== tracker.name
          );

detectMeeting({
  tracker,
  otherTrackers,
  newPosition,
  calculateDistance,
  setHotspots,
});

          const CONVOY_THRESHOLD_SECONDS = 3;
          const CONVOY_DISTANCE = 0.08;

const otherMovingTrackers = current.filter(
  (otherTracker) =>
    otherTracker.name !== tracker.name &&
    otherTracker.status === "Online" &&
    newStatus === "Online"
);

detectConvoy({
  tracker,
  otherTrackers: otherMovingTrackers,
  newPosition,
  newStatus,
  newTargetIndex,
  calculateDistance,
  getLocationName,
});

          return {
            ...tracker,
            position: newPosition,
            route:
              newPosition[0] === tracker.position[0] &&
              newPosition[1] === tracker.position[1]
                ? tracker.route
                : [...tracker.route, newPosition],
            speed: newSpeed,
            status: newStatus,
            stationarySince: newStationarySince,
            stopDetected: newStopDetected,
            targetIndex: newTargetIndex,
            source: "Demo",
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStops((currentStops) =>
        currentStops.map((stop) =>
          stop.status === "Active" ? { ...stop, duration: stop.duration + 1 } : stop
        )
      );

      setMeetings((currentMeetings) =>
        currentMeetings.map((meeting) =>
          meeting.status === "Active"
            ? { ...meeting, duration: meeting.duration + 1 }
            : meeting
        )
      );

      setConvoys((currentConvoys) =>
        currentConvoys.map((convoy) =>
          convoy.status === "Active"
            ? { ...convoy, duration: convoy.duration + 1 }
            : convoy
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const generateSummary = () => {
    const summary: string[] = [];

    if (meetings.length > 0) {
      const latestMeeting = meetings[0];
      summary.push(
        `${latestMeeting.trackerA} ontmoette ${latestMeeting.trackerB} in ${latestMeeting.location}.`
      );
    }

    if (convoys.length > 0) {
      const latestConvoy = convoys[0];
      summary.push(
        `${latestConvoy.trackerA} en ${latestConvoy.trackerB} reden samen gedurende ${formatDuration(
          latestConvoy.duration
        )}.`
      );
    }

    if (hotspots.length > 0) {
      const hotspot = [...hotspots].sort(
        (a, b) => b.stops + b.meetings - (a.stops + a.meetings)
      )[0];
      summary.push(
        `${hotspot.location} werd geïdentificeerd als belangrijkste hotspot met ${
          hotspot.stops + hotspot.meetings
        } gebeurtenissen.`
      );
    }

    if (allStops.length > 0) {
      summary.push(`${allStops.length} stoplocaties werden geregistreerd.`);
    }

    if (summary.length === 0) {
      summary.push("Nog geen intelligence events beschikbaar.");
    }

    return summary;
  };

  const generateAssessment = () => {
    const assessment: string[] = [];

    const topHotspot =
      hotspots.length > 0
        ? [...hotspots].sort(
            (a, b) => b.stops + b.meetings - (a.stops + a.meetings)
          )[0]
        : null;

    if (topHotspot) {
      assessment.push(
        `${topHotspot.location} lijkt momenteel de belangrijkste locatie binnen deze case.`
      );
    }

    if (network.length > 0) {
      const strongestRelation = [...network].sort((a, b) => b.count - a.count)[0];
      assessment.push(
        `${strongestRelation.pair} is de sterkste gedetecteerde relatie op basis van het aantal meetings.`
      );
    }

    if (convoys.length > 0) {
      assessment.push(
        "Er werd gezamenlijk verplaatsingsgedrag vastgesteld. Dit kan wijzen op gecoördineerde beweging tussen trackers."
      );
    }

    if (meetings.length > 0 && allStops.length > 0) {
      assessment.push(
        "De combinatie van stops en meetings rond dezelfde locaties kan operationeel relevant zijn voor verdere observatie."
      );
    }

    if (assessment.length === 0) {
      assessment.push("Nog onvoldoende events voor een betekenisvolle assessment.");
    }

    return assessment;
  };

  const generateTimeline = (): TimelineEvent[] => {
    const timeline: TimelineEvent[] = [
      ...alerts.map((alert, index) => ({
        id: `alert-${index}-${alert.time}`,
        time: alert.time,
        type: "Geofence" as const,
        title: `${alert.tracker} ${alert.event} ${alert.zone}`,
        location: alert.zone === "Antwerp Zone" ? "Antwerpen" : alert.zone,
        severity: "Low" as const,
        color: "text-red-300",
        tracker: alert.tracker,
        source: alert.source,
      })),
      ...allStops.map((stop) => ({
        id: stop.id,
        time: stop.startTime,
        type: "Stop" as const,
        title: `${stop.tracker} stopte in ${stop.location} (${formatDuration(
          stop.duration
        )})`,
        location: stop.location,
        severity: "Medium" as const,
        color: "text-orange-300",
        tracker: stop.tracker,
        source: stop.source,
      })),
      ...meetings.map((meeting) => ({
        id: meeting.id,
        time: meeting.startTime,
        type: "Meeting" as const,
        title: `${meeting.trackerA} + ${meeting.trackerB} in ${
          meeting.location
        } (${meeting.status}, ${formatDuration(meeting.duration)})`,
        location: meeting.location,
        severity: "High" as const,
        color: "text-blue-300",
        tracker: `${meeting.trackerA} ${meeting.trackerB}`,
        source: meeting.source,
      })),
      ...convoys.map((convoy) => ({
        id: convoy.id,
        time: convoy.startTime,
        type: "Convoy" as const,
        title: `${convoy.trackerA} + ${convoy.trackerB} reden samen (${formatDuration(
          convoy.duration
        )})`,
        location: convoy.lastLocation,
        severity: "High" as const,
        color: "text-cyan-300",
        tracker: `${convoy.trackerA} ${convoy.trackerB}`,
        source: convoy.source,
      })),
    ];

    return timeline.sort((a, b) => a.time.localeCompare(b.time));
  };

  const getTimelineLocations = () => {
    const locations = generateTimeline()
      .map((event) => event.location)
      .filter((location): location is string => Boolean(location));

    return ["All", ...Array.from(new Set(locations))];
  };

const getTimelineTrackers = () => {
  const trackerNames = trackers
.filter(Boolean)
    .map((tracker) => tracker.name);

  return ["All", ...Array.from(new Set(trackerNames))];
};

const visibleTrackers =
  trackerSourceFilter === "All"
    ? trackers
:trackers.filter((tracker: any) => tracker.source === trackerSourceFilter)

  const filteredTimeline = () => {
    let timeline = generateTimeline().reverse();

    if (timelineFilter !== "All") {
      timeline = timeline.filter((event) => event.type === timelineFilter);
    }

    if (timelineTrackerFilter !== "All") {
      timeline = timeline.filter((event) => event.title.includes(timelineTrackerFilter));
    }

    if (timelineLocationFilter !== "All") {
      timeline = timeline.filter((event) => event.location === timelineLocationFilter);
    }

    if (timelineSeverityFilter !== "All") {
      timeline = timeline.filter((event) => event.severity === timelineSeverityFilter);
    }

    return timeline;
  };

  if (!selectedTracker) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-8">
        Geen tracker beschikbaar.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex">
      <aside className="w-72 bg-slate-900 border-r border-slate-800 p-6">
        <h1 className="text-2xl font-bold mb-8">GPS Intelligence</h1>

        <nav className="space-y-3">
          <div
            onClick={() => setActiveTab("live")}
            className={`rounded-lg px-4 py-3 cursor-pointer ${
              activeTab === "live" ? "bg-slate-800" : "text-slate-300"
            }`}
          >
            📍 Live Tracking
          </div>

          <div
            onClick={() => setActiveTab("analyse")}
            className={`rounded-lg px-4 py-3 cursor-pointer ${
              activeTab === "analyse" ? "bg-slate-800" : "text-slate-300"
            }`}
          >
            📊 Analyse
          </div>

          <div
            onClick={() => setActiveTab("timeline")}
            className={`rounded-lg px-4 py-3 cursor-pointer ${
              activeTab === "timeline" ? "bg-slate-800" : "text-slate-300"
            }`}
          >
            🕒 Timeline
          </div>
<button
  onClick={() => setActiveTab("trips")}
  className={`w-full text-left px-4 py-3 rounded-lg ${
    activeTab === "trips" ? "bg-slate-700 text-white" : "text-slate-300"
  }`}
>
  🚗 Trips
</button>

<button
  onClick={() => setActiveTab("devices")}
  className={`w-full text-left px-4 py-3 rounded-lg ${
    activeTab === "devices" ? "bg-slate-700 text-white" : "text-slate-300"
  }`}
>
  📡 Device Center
</button>

          <div className="text-slate-300 px-4 py-3">🚗 Trackers</div>
          <div className="text-slate-300 px-4 py-3">📜 Historiek</div>
          <div className="text-slate-300 px-4 py-3">🛑 Stops</div>
          <div className="text-slate-300 px-4 py-3">🔔 Alerts</div>
          <div className="text-slate-300 px-4 py-3">📁 Cases</div>
          <div className="text-slate-300 px-4 py-3">⚙️ Settings</div>
        </nav>
      </aside>

      <section className="flex-1 p-8">
{activeTab === "live" && (
  <LiveDashboard
    trackers={filteredTrackers}
    selectedTracker={selectedTracker}
    selectedTrackerName={selectedTrackerName}
    setSelectedTrackerName={setSelectedTrackerName}
    alerts={filteredAlerts}
    allStops={filteredStops}
    meetings={filteredMeetings}
    formatDuration={formatDuration}
    trackerSourceFilter={trackerSourceFilter}
    setTrackerSourceFilter={setTrackerSourceFilter}
  />
)}
        {activeTab === "analyse" && (
          <>
            <h2 className="text-4xl font-bold mb-6">Analyse</h2>

            {generateTimeline().length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-lg mb-4 text-white">🕒 Recent Timeline</h3>
                <div className="space-y-3">
                  {generateTimeline()
                    .slice(-5)
                    .reverse()
                    .map((event) => (
                      <div key={event.id} className="flex gap-4 bg-slate-800 rounded-lg p-3">
                        <div className="w-24 text-sm text-slate-400">{event.time}</div>
                        <div className={`w-24 text-sm font-semibold ${event.color}`}>{event.type}</div>
                        <div className="flex-1 text-sm text-white">{event.title}</div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            event.severity === "High"
                              ? "bg-red-900 text-red-300"
                              : event.severity === "Medium"
                              ? "bg-orange-900 text-orange-300"
                              : "bg-green-900 text-green-300"
                          }`}
                        >
                          {event.severity}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {network.length > 0 ? (
              <div className="bg-purple-900 border border-purple-700 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-lg mb-4">🕸️ Meeting Network</h3>
                <div className="space-y-2">
                  {[...network]
                    .sort((a, b) => b.count - a.count)
                    .map((item) => (
                      <div
                        key={item.pair}
                        className="grid grid-cols-2 gap-4 text-sm bg-purple-950 rounded-lg p-3"
                      >
                        <div>{item.pair}</div>
                        <div>{item.count} meetings</div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-300 mb-6">
                Nog geen meeting network beschikbaar. Wacht tot er minstens één meeting is bevestigd.
              </div>
            )}

            {hotspots.length > 0 && (
              <div className="bg-amber-900 border border-amber-700 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-lg mb-2">🔥 Hotspots</h3>
                <div className="grid grid-cols-4 gap-4 text-xs font-bold text-amber-300 px-3 mb-2">
                  <div>Locatie</div>
                  <div>Stops</div>
                  <div>Meetings</div>
                  <div>Totaal</div>
                </div>
                <div className="space-y-2">
                  {[...hotspots]
                    .sort((a, b) => b.stops + b.meetings - (a.stops + a.meetings))
                    .map((spot) => (
                      <div
                        key={spot.location}
                        onClick={() => setSelectedHotspot(spot.location)}
                        className="grid grid-cols-4 gap-4 text-sm bg-amber-950 rounded-lg p-3 cursor-pointer hover:bg-amber-800"
                      >
                        <div>{spot.location}</div>
                        <div>{spot.stops} stops</div>
                        <div>{spot.meetings} meetings</div>
                        <div>{spot.stops + spot.meetings} events</div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {selectedHotspot && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
                <h3 className="text-2xl font-bold mb-4">Details voor {selectedHotspot}</h3>
                <div className="mb-6">
                  <h4 className="font-semibold mb-2 text-orange-300">🛑 Stops</h4>
                  {allStops.filter((stop) => stop.location === selectedHotspot).length > 0 ? (
                    <div className="space-y-2">
                      {allStops
                        .filter((stop) => stop.location === selectedHotspot)
                        .map((stop) => (
                          <div
                            key={stop.id}
                            className="grid grid-cols-5 gap-4 text-sm bg-slate-800 rounded-lg p-3"
                          >
                            <div>{stop.startTime}</div>
                            <div>{stop.tracker}</div>
                            <div>{stop.status}</div>
                            <div>{formatDuration(stop.duration)}</div>
                            <div>{stop.source}</div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-slate-400 text-sm">Geen stops op deze locatie.</div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-white">🤝 Meetings</h3>
                  {meetings.filter((meeting) => meeting.location === selectedHotspot).length > 0 ? (
                    <div className="space-y-2">
                      {meetings
                        .filter((meeting) => meeting.location === selectedHotspot)
                        .map((meeting) => (
                          <div
                            key={meeting.id}
                            className="grid grid-cols-6 gap-4 text-sm bg-slate-800 rounded-lg p-3"
                          >
                            <div>{meeting.startTime}</div>
                            <div>
                              {meeting.trackerA} + {meeting.trackerB}
                            </div>
                            <div>{meeting.status}</div>
                            <div>{formatDuration(meeting.duration)}</div>
                            <div>{meeting.location}</div>
                            <div>{meeting.source}</div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-slate-400 text-sm">Geen meetings op deze locatie.</div>
                  )}
                </div>
              </div>
            )}

            {convoys.length > 0 && (
              <div className="bg-cyan-900 border border-cyan-700 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-lg mb-2">🚗 Convoys</h3>
                <div className="space-y-2">
                  {convoys.map((convoy) => (
                    <div
                      key={convoy.id}
                      className="grid grid-cols-6 gap-4 text-sm bg-cyan-950 rounded-lg p-3"
                    >
                      <div>
                        {convoy.trackerA} + {convoy.trackerB}
                      </div>
                      <div>{convoy.status}</div>
                      <div>{formatDuration(convoy.duration)}</div>
                      <div>{convoy.lastLocation}</div>
                      <div>{convoy.startTime}</div>
                      <div>{convoy.source}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#052E16] border border-[#16A34A] rounded-xl p-6 mb-6">
              <h3 className="font-bold text-lg mb-2 text-[#22C55E]">🧠 Intelligence Summary</h3>
              <div className="space-y-4">
                {generateSummary().map((line, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-[#063B2E] border border-[#0E5A46] rounded-lg px-4 py-2 text-white"
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#25D366] text-black text-sm font-bold">
                      ✓
                    </div>
                    <div className="text-sm">{line}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#031F12] border border-[#16A34A] rounded-xl p-4 mb-6">
              <h3 className="font-bold text-lg mb-4 text-[#22C55E]">🧠 AI Assessment</h3>
              <div className="space-y-2">
                {generateAssessment().map((line, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-[#063B2E] border border-[#0E5A46] rounded-lg px-4 py-2 text-white"
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#25D366] text-black text-sm font-bold">
                      !
                    </div>
                    <div className="text-sm">{line}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "timeline" && (
          <>
            <h2 className="text-4xl font-bold mb-6">Timeline</h2>

            <div className="flex items-start justify-between mb-6 gap-4">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(["All", "Geofence", "Stop", "Meeting", "Convoy"] as const).map(
                    (filter) => (
                      <button
                        key={filter}
                        onClick={() => setTimelineFilter(filter)}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          timelineFilter === filter
                            ? "bg-blue-600 text-white"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {filter}
                      </button>
                    )
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {getTimelineTrackers().map((tracker) => (
                    <button
                      key={tracker}
                      onClick={() => setTimelineTrackerFilter(tracker)}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        timelineTrackerFilter === tracker
                          ? "bg-green-600 text-white"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {tracker === "All" ? "All Trackers" : tracker}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {getTimelineLocations().map((location) => (
                    <button
                      key={location}
                      onClick={() => setTimelineLocationFilter(location)}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        timelineLocationFilter === location
                          ? "bg-amber-600 text-white"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {location === "All" ? "All Locations" : location}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {(["All", "High", "Medium", "Low"] as const).map((severity) => (
                    <button
                      key={severity}
                      onClick={() => setTimelineSeverityFilter(severity)}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        timelineSeverityFilter === severity
                          ? severity === "High"
                            ? "bg-red-600 text-white"
                            : severity === "Medium"
                            ? "bg-orange-600 text-white"
                            : severity === "Low"
                            ? "bg-green-600 text-white"
                            : "bg-purple-600 text-white"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {severity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setTimelineView("table")}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    timelineView === "table"
                      ? "bg-slate-600 text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  Table View
                </button>

                <button
                  onClick={() => setTimelineView("vertical")}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    timelineView === "vertical"
                      ? "bg-slate-600 text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  Vertical View
                </button>
              </div>
            </div>

            {generateTimeline().length > 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-lg mb-4 text-white">🕒 Event Timeline</h3>

                {timelineView === "table" && (
                  <div className="space-y-3">
                    {filteredTimeline().map((event) => (
                      <div
                        key={event.id}
                        onClick={() => setSelectedTimelineEvent(event)}
                        className="flex gap-4 bg-slate-800 rounded-lg p-3 cursor-pointer hover:bg-slate-700"
                      >
                        <div className="w-24 text-sm text-slate-400">{event.time}</div>
                        <div className={`w-24 text-sm font-semibold ${event.color}`}>
                          {event.type}
                        </div>
                        <div className="flex-1 text-sm text-white">{event.title}</div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            event.severity === "High"
                              ? "bg-red-900 text-red-300"
                              : event.severity === "Medium"
                              ? "bg-orange-900 text-orange-300"
                              : "bg-green-900 text-green-300"
                          }`}
                        >
                          {event.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {timelineView === "vertical" && (
                  <div className="relative border-l border-slate-700 ml-6 space-y-6">
                    {filteredTimeline().map((event) => (
                      <div
                        key={event.id}
                        onClick={() => setSelectedTimelineEvent(event)}
                        className="relative pl-8 cursor-pointer group"
                      >
                        <div className="absolute -left-3 top-1 w-6 h-6 rounded-full bg-slate-800 border border-slate-500 flex items-center justify-center group-hover:border-white">
                          {event.type === "Meeting"
                            ? "🤝"
                            : event.type === "Stop"
                            ? "🛑"
                            : event.type === "Convoy"
                            ? "🚗"
                            : "🔔"}
                        </div>

                        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 group-hover:bg-slate-700">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm text-slate-400">{event.time}</span>
                            <span className={`text-sm font-semibold ${event.color}`}>
                              {event.type}
                            </span>
                            <span
                              className={`ml-auto text-xs px-2 py-1 rounded-full ${
                                event.severity === "High"
                                  ? "bg-red-900 text-red-300"
                                  : event.severity === "Medium"
                                  ? "bg-orange-900 text-orange-300"
                                  : "bg-green-900 text-green-300"
                              }`}
                            >
                              {event.severity}
                            </span>
                          </div>
                          <div className="text-white text-sm">{event.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedTimelineEvent && (
                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mt-6">
                    <h3 className="text-xl font-bold mb-4 text-white">Event Details</h3>
                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <div className="text-slate-400">Tijd</div>
                        <div className="text-white">{selectedTimelineEvent.time}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Type</div>
                        <div className={selectedTimelineEvent.color}>
                          {selectedTimelineEvent.type}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">Locatie</div>
                        <div className="text-white">{selectedTimelineEvent.location}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Severity</div>
                        <div className="text-white">{selectedTimelineEvent.severity}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Source</div>
                        <div className="text-white">{selectedTimelineEvent.source}</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-slate-400 text-sm">Omschrijving</div>
                      <div className="text-white text-sm mt-1">{selectedTimelineEvent.title}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-300">
                Nog geen timeline events beschikbaar.
              </div>
            )}
              
          </>
            )}
{activeTab === "trips" && (
  <TripsView
    trips={trips}
    formatDuration={formatDuration}
    formatDistance={formatDistance}
  />
)}
{activeTab === "devices" && (
<DeviceCenter
  devices={trackers.map((tracker: any) => ({
    id: String(tracker.deviceId ?? tracker.id ?? tracker.name),
    name: tracker.name,
    source: tracker.source === "Demo" ? "demo" : "traccar",
    status:
      tracker.status === "Online"
        ? "online"
        : tracker.status === "Stilstaand"
        ? "stopped"
        : tracker.status === "Stop"
        ? "stopped"
        : "offline",
    latitude: tracker.latitude ?? tracker.position?.[0] ?? 0,
    longitude: tracker.longitude ?? tracker.position?.[1] ?? 0,
    speed: tracker.speed ?? 0,
    battery: tracker.battery,
    lastUpdate: tracker.lastUpdate
      ? new Date(tracker.lastUpdate)
      : new Date(),
  }))}
/>
)}
      </section>
    </main>
  )}
