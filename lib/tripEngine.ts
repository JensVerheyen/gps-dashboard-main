export type Trip = {
  deviceId: number;
  deviceName: string;

  startTime: string;
  endTime: string;

  startAddress: string;
  endAddress: string;

  duration: number;
  distance: number;

  averageSpeed: number;
  maxSpeed: number;

  startLat: number;
  startLon: number;

  endLat: number;
  endLon: number;
};

export function normalizeTrips(data: any[]): Trip[] {
  return data
  .filter((trip) => {
    const hasValidCoordinates =
      trip.startLat !== 0 &&
      trip.startLon !== 0 &&
      trip.endLat !== 0 &&
      trip.endLon !== 0;

    const realisticDistance = trip.distance < 500000; // max 500 km

    return hasValidCoordinates && realisticDistance;
  })
  .map((trip) => ({
    deviceId: trip.deviceId,
    deviceName: trip.deviceName,

    startTime: trip.startTime,
    endTime: trip.endTime,

    startAddress: trip.startAddress,
    endAddress: trip.endAddress,

    duration: trip.duration,
    distance: trip.distance,

    averageSpeed: trip.averageSpeed,
    maxSpeed: trip.maxSpeed,

    startLat: trip.startLat,
    startLon: trip.startLon,

    endLat: trip.endLat,
    endLon: trip.endLon,
  }));
}