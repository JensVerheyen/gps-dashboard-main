import { DeviceSource } from "../types/Device";

type Props = {
  source: DeviceSource;
};

export default function DeviceSourceBadge({ source }: Props) {
  const config: Record<DeviceSource, { label: string; className: string }> = {
    demo: {
      label: "DEMO",
      className: "bg-slate-700 text-slate-200",
    },
    traccar: {
      label: "TRACCAR",
      className: "bg-cyan-900 text-cyan-300",
    },
    flespi: {
      label: "FLESPI",
      className: "bg-purple-900 text-purple-300",
    },
    micodus: {
      label: "MICODUS",
      className: "bg-amber-900 text-amber-300",
    },
  };

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full ${config[source].className}`}
    >
      {config[source].label}
    </span>
  );
}