import { Device } from "../types/Device";
import DeviceStatusBadge from "./DeviceStatusBadge";

type DeviceCardProps = {
  device: Device;
  isSelected?: boolean;
  onSelect: (device: Device) => void;
};

export default function DeviceCard({
  device,
  isSelected = false,
  onSelect,
}: DeviceCardProps) {
    
    return (
    <div
      onClick={() => onSelect(device)}
className={`bg-slate-800 border rounded-xl p-2 hover:border-slate-500 transition cursor-pointer ${
  isSelected
    ? "border-blue-500 ring-2 ring-blue-500/30"
    : "border-slate-700"
}`}    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white">{device.name}</h3>
          <p className="text-xs text-slate-400">{device.source.toUpperCase()}</p>
        </div>

        <DeviceStatusBadge status={device.status} />
      </div>

      <div className="grid grid-cols-2 gap-y-2 text-sm">
        <span className="text-slate-400">Speed</span>
        <span className="text-right">{device.speed} km/h</span>

        <span className="text-slate-400">Battery</span>
        <span className="text-right">{device.battery ?? "-"}%</span>
      </div>
    </div>
  );
}