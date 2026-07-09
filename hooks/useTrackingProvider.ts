import { useMemo } from "react";

import { getTrackers } from "../app/providers/TrackingProvider";
import { useTraccar } from "./useTraccar";
import { Device } from "../app/types/Device";

export function useTrackingProvider(demoTrackers: any[]) {
  const { traccarTrackers } = useTraccar();

  const trackers = useMemo(() => {
    return getTrackers(
      demoTrackers as Device[],
      traccarTrackers as Device[]
    );
  }, [demoTrackers, traccarTrackers]);

  return {
    trackers,
    traccarTrackers,
  };
}