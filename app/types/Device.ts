export type DeviceSource = "demo" | "traccar" | "flespi" | "micodus";

export type DeviceStatus = "online" | "moving" | "stopped" | "offline";

export interface Device {
  id: string;
  name: string;
  source: DeviceSource;

  type?: string;
  manufacturer?: string;
  model?: string;
  firmware?: string;

  imei?: string;
  phoneNumber?: string;
  iccid?: string;
  imsi?: string;
  provider?: string;
  apn?: string;

  status: DeviceStatus;

  latitude: number;
  longitude: number;

  speed: number;
  heading?: number;
  altitude?: number;
  satellites?: number;
  accuracy?: number;

  battery?: number;
  signal?: number;

  lastUpdate: Date;

  vehicle?: string;
  plate?: string;
  driver?: string;
  group?: string;

  tags?: string[];
  alerts?: number;
}