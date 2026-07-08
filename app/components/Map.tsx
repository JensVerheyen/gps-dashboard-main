"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type Tracker = {
  name: string;
  position: [number, number];
  route: [number, number][];
  speed: number;
  battery: number;
  status: string;
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
  startTime: string;
  trackerA: string;
  trackerB: string;
  location: string;
  position: [number, number];
  duration: number;
  status: "Active" | "Ended";
};

const createVehicleIcon = (status: string) => {
  let color = "#22c55e";

  if (status === "Stilstaand") color = "#f97316";
  if (status === "Offline") color = "#ef4444";

  return L.divIcon({
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
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        font-size: 18px;
      ">
        🚗
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
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

export default function Map({
  trackers,
  selectedTracker,
  stops = [],
  meetings = [],
}: {
  trackers: Tracker[];
  selectedTracker: Tracker;
  stops?: Stop[];
  meetings?: Meeting[];
}) {

return (
    <MapContainer
  key={selectedTracker.name}
  center={selectedTracker.position}
  zoom={12}
  style={{ height: "500px", width: "100%" }}
>
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
      Duur: {meeting.duration}s
    </Popup>
  </Marker>
))}

{stops.map((stop, index) => (
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
      Duur: {Math.floor(stop.duration / 60)
  .toString()
  .padStart(2, "0")}
:
{(stop.duration % 60)
  .toString()
  .padStart(2, "0")}
    </Popup>
  </Marker>
))}

{trackers
  .filter((tracker) => tracker && tracker.position)
  .map((tracker) => {
    
    const isStop = tracker.stopDetected || tracker.status === "Stop";

  return (
    <Marker
      key={tracker.name}
      position={tracker.position}
      icon={isStop ? createStopIcon() : createVehicleIcon(tracker.status)}
    >
                <Popup>
            <strong>{tracker.name}</strong>
            <br />
            Status: {tracker.status}
            <br />
            Snelheid: {tracker.speed} km/u
            <br />
            Batterij: {tracker.battery}%
          </Popup>
    </Marker>
  );
})}    </MapContainer>
  );
}