"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

type Tracker = {
  name: string;
  position: [number, number];
  route: [number, number][];
  speed: number;
  battery: number;
  status: string;
  stopDetected: boolean;
  stationarySince?: number | null;
};
type Stop = {
  startTime: string;
  tracker: string;
  location: string;
  position: [number, number];
  duration: number;
};

type Meeting = {
  startTime: string;
  trackerA: string;
  trackerB: string;
  location: string;
  position: [number, number];
  duration: number;
  status: "Active" | "Ended";
};
const vehicleIconCache = new globalThis.Map<string, L.DivIcon>();

const createVehicleIcon = (status: string, isSelected = false) => {
  const cacheKey = `${status}-${isSelected}`;

  const cachedIcon = vehicleIconCache.get(cacheKey);

  if (cachedIcon) {
    return cachedIcon;
  }

  let color = "#22c55e";
  
  if (status === "Stilstaand") color = "#f97316";
  if (status === "Offline") color = "#ef4444";

const icon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 34px;
      height: 34px;
      border-radius: 9999px;
      background: ${color};
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: ${
        isSelected
          ? "0 0 0 8px rgba(59,130,246,0.25), 0 0 22px rgba(59,130,246,0.9)"
          : "0 4px 10px rgba(0,0,0,0.35)"
      };
      animation: ${
        isSelected
          ? "argus-marker-pulse 1.2s ease-out 2"
          : "none"
      };
      font-size: 18px;
    ">
      🚗
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -18],
});

vehicleIconCache.set(cacheKey, icon);

return icon;
};

const createStopIcon = () => {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 34px;
        height: 34px;
        border-radius: 9999px;
        background: #dc2626;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        font-size: 18px;
      ">
        🛑
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
};
const createMeetingIcon = () => {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 38px;
        height: 38px;
        border-radius: 9999px;
        background: #2563eb;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        font-size: 18px;
      ">
        🤝
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
};
const markerPulseStyles = `
  @keyframes argus-marker-pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.18);
    }
    100% {
      transform: scale(1);
    }
  }
`;
function MapFocusController({
  trackerName,
  position,
  status,
  follow,
}: {
  trackerName: string;
  position: [number, number];
  status: string;
  follow: boolean;
}) {
  const map = useMap();

useEffect(() => {
  const targetZoom = Math.max(map.getZoom(), 14);

  map.flyTo(position, targetZoom, {
    animate: true,
    duration: 0.8,
  });
}, [map, trackerName]);

  useEffect(() => {
    const isMoving =
      status === "Online" ||
      status === "Moving" ||
      status === "moving";

    if (!follow || !isMoving) {
      return;
    }

    const currentCenter = map.getCenter();
    const distance = currentCenter.distanceTo(position);

    if (distance > 20) {
      map.panTo(position, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [map, position, status, follow]);

  return null;
}

function MapInteractionController({
  follow,
  onDisableFollow,
}: {
  follow: boolean;
  onDisableFollow: () => void;
}) {
  useMapEvents({
    dragstart: () => {
      if (follow) {
        onDisableFollow();
      }
    },
  });

  return null;
}

function formatStopDuration(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}u ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}u ${minutes}m`;
  }

  return `${minutes}m`;
}
export default function Map({
  trackers,
  selectedTracker,
  stops = [],
  meetings = [],
  onOpenDeviceCenter,
  followSelectedTracker,
  setFollowSelectedTracker,
}: {
  trackers: Tracker[];
  selectedTracker: Tracker;
  stops?: Stop[];
  meetings?: Meeting[];
  onOpenDeviceCenter: (tracker: Tracker) => void;
  followSelectedTracker: boolean;
  setFollowSelectedTracker: (value: boolean) => void;
}) {

return (
    <MapContainer
  center={selectedTracker.position}
  zoom={12}
  style={{ height: "500px", width: "100%" }}
>
  <MapFocusController 
  trackerName={selectedTracker.name}
  position={selectedTracker.position} 
  status={selectedTracker.status}
  follow={followSelectedTracker}
  />

<MapInteractionController
  follow={followSelectedTracker}
  onDisableFollow={() => setFollowSelectedTracker(false)}
/>
  <style>{markerPulseStyles}</style>
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
<Circle
  center={[51.2194, 4.4025]}
  radius={5000}
  pathOptions={{
    color: "#3b82f6",
    fillColor: "#3b82f6",
    fillOpacity: 0.15,
  }}
/>
{trackers
  .filter((tracker) => tracker && tracker.route)
  .map((tracker) => (
            <Polyline
          key={`${tracker.name}-route`}
          positions={tracker.route}
          color={
            tracker.status === "Online"
              ? "#22c55e"
              : tracker.status === "Stilstaand"
              ? "#f97316"
              : "#ef4444"
          }
          weight={4}
        />
      ))}
{meetings.map((meeting, index) => (
  <Marker
    key={`${meeting.trackerA}-${meeting.trackerB}-${index}`}
position={[
  (meeting.position?.[0] ?? 51.0543) + 0.001,
  (meeting.position?.[1] ?? 3.7174) + 0.001,
]}
    icon={createMeetingIcon()}
  >
    <Popup>
      <strong>Meeting Detected</strong>
      <br />
      {meeting.trackerA} + {meeting.trackerB}
      <br />
      Locatie: {meeting.location}
      <br />
      Status: {meeting.status}
      <br />
    </Popup>
  </Marker>
))}
{stops.map((stop, index) => {
  const relatedTracker = trackers.find(
    (tracker) => tracker.name === stop.tracker
  );

  return (
    <Marker
      key={`${stop.tracker}-stop-${index}`}
      position={stop.position}
      icon={createStopIcon()}
    >
      <Popup>
        <strong>Stop detected</strong>
        <br />
        Tracker: {stop.tracker}
        <br />
        Locatie: {stop.location}
        <br />
        Start: {stop.startTime}
        <br />
        Batterij: {relatedTracker?.battery ?? "-"}%
        <br />
        Duur: {formatStopDuration(stop.duration)}

        {relatedTracker && (
          <div style={{ marginTop: "10px" }}>
            <button
              onClick={() => onOpenDeviceCenter(relatedTracker)}
              style={{
                width: "100%",
                padding: "6px 10px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                background: "#1e293b",
                color: "white",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              📡 Open in Device Center
            </button>
          </div>
        )}
      </Popup>
    </Marker>
  );
})}

</MapContainer>
  );
}