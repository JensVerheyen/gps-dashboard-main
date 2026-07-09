import { Device } from "../types/Device";

import { getDemoTrackers } from "./DemoProvider";
import { getTraccarTrackers } from "./TraccarProvider";

export function getTrackers(
  demoTrackers: Device[],
  traccarTrackers: Device[]
): Device[] {
  return [
    ...getDemoTrackers(demoTrackers),
    ...getTraccarTrackers(traccarTrackers),
  ];
}