import { useMemo } from "react";

import { getDevices } from "../app/providers/DeviceProvider";
import { useTraccar } from "./useTraccar";
import { Device } from "../app/types/Device";

export function useDevice(demoTrackers: Device[]) {
  const { traccarTrackers } = useTraccar();

  const devices = useMemo(() => {
    return getDevices(
      demoTrackers,
      traccarTrackers as Device[]
    );
  }, [demoTrackers, traccarTrackers]);

  return {
    devices,
    traccarDevices: traccarTrackers as Device[],
  };
}