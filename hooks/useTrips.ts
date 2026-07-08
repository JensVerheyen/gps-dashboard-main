"use client";

import { useEffect, useState } from "react";
import { normalizeTrips, type Trip } from "@/lib/tripEngine";

export function useTrips(deviceId?: number) {
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    if (!deviceId) {
      setTrips([]);
      return;
    }

    async function loadTrips() {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 30);

      const response = await fetch(
        `/api/traccar/trips?deviceId=${deviceId}&from=${from.toISOString()}&to=${to.toISOString()}`
      );

      if (!response.ok) {
        setTrips([]);
        return;
      }

      const json = await response.json();
      setTrips(normalizeTrips(json.trips ?? []));
    }

    loadTrips();
  }, [deviceId]);

  return trips;
}