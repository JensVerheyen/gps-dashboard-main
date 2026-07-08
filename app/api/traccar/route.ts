import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.TRACCAR_URL;
  const email = process.env.TRACCAR_EMAIL;
  const password = process.env.TRACCAR_PASSWORD;

  if (!url || !email || !password) {
    return NextResponse.json(
      { error: "Missing Traccar environment variables" },
      { status: 500 }
    );
  }

  const auth = Buffer.from(`${email}:${password}`).toString("base64");

  const [devicesRes, positionsRes] = await Promise.all([
    fetch(`${url}/api/devices`, {
      headers: { Authorization: `Basic ${auth}` },
      cache: "no-store",
    }),
    fetch(`${url}/api/positions`, {
      headers: { Authorization: `Basic ${auth}` },
      cache: "no-store",
    }),
  ]);

  if (!devicesRes.ok || !positionsRes.ok) {
    return NextResponse.json(
      { error: "Failed to fetch Traccar data" },
      { status: 500 }
    );
  }

  const devices = await devicesRes.json();
  const positions = await positionsRes.json();

  return NextResponse.json({ devices, positions });
}