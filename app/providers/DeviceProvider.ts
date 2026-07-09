import { Device } from "../types/Device";
import { getTrackers } from "./TrackingProvider";

export function getDevices(
  demoTrackers: Device[],
  traccarTrackers: Device[]
): Device[] {
  return getTrackers(demoTrackers, traccarTrackers);
}