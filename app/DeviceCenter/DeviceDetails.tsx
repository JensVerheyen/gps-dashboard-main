import { Device } from "../types/Device";
import DeviceStatusBadge from "./DeviceStatusBadge";

type DeviceDetailsProps = {
  device: Device;
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-right text-white">{value ?? "Not available"}</span>
    </div>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-slate-950 border border-slate-700 rounded-lg p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

export default function DeviceDetails({ device }: DeviceDetailsProps) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{device.name}</h2>
          <p className="text-slate-400 text-sm">{device.source.toUpperCase()}</p>
        </div>

        <DeviceStatusBadge status={device.status} />
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
        <SummaryItem label="Speed" value={`${device.speed} km/h`} />
        <SummaryItem label="Battery" value={device.battery !== undefined ? `${device.battery}%` : "-"} />
        <SummaryItem label="Signal" value={device.signal ?? "-"} />
        <SummaryItem label="Heading" value={device.heading !== undefined ? `${device.heading}°` : "-"} />
<SummaryItem
  label="Last Update"
  value={device.lastUpdate.toLocaleString("nl-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })}
/>
      </div>

      <section className="border border-slate-700 rounded-xl p-4 bg-slate-950">
        <h3 className="font-semibold mb-3">Quick Actions</h3>

        <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
          <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg">
            📍 Open on Map
          </button>
          <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg">
            🕒 Timeline
          </button>
          <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg">
            🛣 Trips
          </button>
          <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg">
            📁 Add to Case
          </button>
          <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg">
            ⚡ Commands
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section>
          <h3 className="font-semibold mb-3">Live Status</h3>
          <div className="space-y-2">
            <DetailRow label="Latitude" value={device.latitude.toFixed(5)} />
            <DetailRow label="Longitude" value={device.longitude.toFixed(5)} />
            <DetailRow label="Speed" value={`${device.speed} km/h`} />
            <DetailRow label="Heading" value={device.heading !== undefined ? `${device.heading}°` : null} />
            <DetailRow label="Battery" value={device.battery !== undefined ? `${device.battery}%` : null} />
            <DetailRow label="Signal" value={device.signal} />
            <DetailRow label="Last Update" value={device.lastUpdate.toLocaleString()} />
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-3">Operational Context</h3>
          <div className="space-y-2">
            <DetailRow label="Vehicle" value={device.vehicle} />
            <DetailRow label="License Plate" value={device.plate} />
            <DetailRow label="Driver" value={device.driver} />
            <DetailRow label="Group" value={device.group} />
            <DetailRow label="Assigned Case" value="Not assigned" />
            <DetailRow label="Priority" value="Normal" />
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-3">Communication</h3>
          <div className="space-y-2">
            <DetailRow label="IMEI" value={device.imei} />
            <DetailRow label="Phone Number" value={device.phoneNumber} />
            <DetailRow label="ICCID" value={device.iccid} />
            <DetailRow label="IMSI" value={device.imsi} />
            <DetailRow label="Provider" value={device.provider} />
            <DetailRow label="APN" value={device.apn} />
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-3">Device Information</h3>
          <div className="space-y-2">
            <DetailRow label="Type" value={device.type ?? "GPS Tracker"} />
            <DetailRow label="Manufacturer" value={device.manufacturer} />
            <DetailRow label="Model" value={device.model} />
            <DetailRow label="Firmware" value={device.firmware} />
          </div>
        </section>
      </div>
    </div>
  );
}