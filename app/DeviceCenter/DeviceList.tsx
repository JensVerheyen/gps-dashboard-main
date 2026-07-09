import { Device } from "../types/Device";
import DeviceCard from "./DeviceCard";

type DeviceListProps = {
  devices: Device[];
  selectedDeviceId?: string;
  onSelect: (device: Device) => void;
};

export default function DeviceList({
  devices,
  selectedDeviceId,
  onSelect,
}: DeviceListProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {devices.map((device) => (
        <DeviceCard
          key={device.id}
          device={device}
          isSelected={device.id === selectedDeviceId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}