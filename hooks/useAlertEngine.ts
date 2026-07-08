import { useState } from "react";

export function useAlertEngine() {
  const [alerts, setAlerts] = useState<any[]>([]);

  return {
    alerts,
    setAlerts,
  };
}