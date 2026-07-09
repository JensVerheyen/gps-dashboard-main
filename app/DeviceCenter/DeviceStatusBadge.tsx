import { DeviceStatus } from "../types/Device";

type Props = {
  status: DeviceStatus;
};

export default function DeviceStatusBadge({ status }: Props) {
  const config: Record<DeviceStatus, { label: string; className: string }> = {
    online: {
      label: "ONLINE",
      className: "bg-green-900 text-green-300 border-green-700",
    },
    moving: {
      label: "MOVING",
      className: "bg-blue-900 text-blue-300 border-blue-700",
    },
    stopped: {
      label: "STOPPED",
      className: "bg-orange-900 text-orange-300 border-orange-700",
    },
    offline: {
      label: "OFFLINE",
      className: "bg-red-900 text-red-300 border-red-700",
    },
  };

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full border ${config[status].className}`}
    >
      {config[status].label}
    </span>
  );
}