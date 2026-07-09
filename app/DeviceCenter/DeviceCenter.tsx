import { useState } from "react";

import { Device } from "../types/Device";
import DeviceList from "./DeviceList";
import DeviceDetails from "./DeviceDetails";

type DeviceCenterProps = {
  devices: Device[];
};

export default function DeviceCenter({ devices }: DeviceCenterProps) {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
const [searchQuery, setSearchQuery] = useState("");

const filteredDevices = devices.filter((device) =>
  device.name.toLowerCase().includes(searchQuery.toLowerCase())
);
const onlineCount = devices.filter((d) => d.status === "online").length;
const movingCount = devices.filter((d) => d.status === "moving").length;
const stoppedCount = devices.filter((d) => d.status === "stopped").length;
const offlineCount = devices.filter((d) => d.status === "offline").length;

  return (
    <div className="space-y-6">
<div className="flex items-end justify-between gap-4">
<div>
    <h1 className="text-3xl font-bold">Device Center</h1>

    <div className="mt-2 flex flex-wrap gap-3 text-sm">

        <span className="bg-slate-800 px-3 py-1 rounded-full">
            📡 {devices.length} Devices
        </span>

        <span className="bg-green-900/40 text-green-300 px-3 py-1 rounded-full">
            🟢 {onlineCount} Online
        </span>

        <span className="bg-blue-900/40 text-blue-300 px-3 py-1 rounded-full">
            🔵 {movingCount} Moving
        </span>

        <span className="bg-orange-900/40 text-orange-300 px-3 py-1 rounded-full">
            🟠 {stoppedCount} Stopped
        </span>

        <span className="bg-red-900/40 text-red-300 px-3 py-1 rounded-full">
            🔴 {offlineCount} Offline
        </span>

    </div>
</div>

  <input
    value={searchQuery}
    onChange={(event) => setSearchQuery(event.target.value)}
    placeholder="Search devices..."
    className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
  />
</div>

<div className="grid grid-cols-1 xl:grid-cols-[250px_1fr] gap-6 items-start">
<DeviceList
    devices={filteredDevices}
    selectedDeviceId={selectedDevice?.id}
    onSelect={setSelectedDevice}
/>
        {selectedDevice ? (
          <DeviceDetails device={selectedDevice} />
        ) : (
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 text-center text-slate-400">
            <div className="text-4xl mb-3">📡</div>
            <h2 className="text-xl font-bold text-white mb-2">
              Select a device
            </h2>
            <p>
              Kies een device om live status, operationele context en acties te bekijken.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}