export type TraccarDevice = {
  id: number;
  name: string;
  status: string;
};

export type TraccarPosition = {
  deviceId: number;
  latitude: number;
  longitude: number;
  speed?: number;
  valid?: boolean;
  deviceTime?: string;
  serverTime?: string;
  fixTime?: string;
  attributes?: {
    batteryLevel?: number;
    motion?: boolean;
  };
};

export function mapTraccarToTrackers(
  devices: TraccarDevice[],
  positions: TraccarPosition[]
) {
    return devices
    .map((device) => {
const position = positions.find((pos) => pos.deviceId === device.id);

if (!position) return null;

const lastUpdate =
  position.deviceTime ??
  position.fixTime ??
  position.serverTime ??
  new Date().toISOString();

const isMoving = position.attributes?.motion === true;

return {
  deviceId: device.id,
  name: device.name,
  position: [position.latitude, position.longitude] as [number, number],
  route: [[position.latitude, position.longitude]] as [number, number][],
  speed: Math.round((position.speed ?? 0) * 1.852),
  battery: position.attributes?.batteryLevel ?? 0,
  status:
    device.status !== "online"
      ? "Offline"
      : isMoving
      ? "Online"
      : "Stilstaand",
  stationarySince: isMoving ? null : Date.now(),
  stopDetected: !isMoving,
  targetIndex: 0,
  source: "Traccar",
  lastUpdate,
};

    })
.filter((tracker) => tracker !== null);
}