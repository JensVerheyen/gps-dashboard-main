import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = process.env.TRACCAR_URL;
  const email = process.env.TRACCAR_EMAIL;
  const password = process.env.TRACCAR_PASSWORD;

  if (!url || !email || !password) {
    return NextResponse.json(
      { error: "Missing Traccar environment variables" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);

  const deviceId = searchParams.get("deviceId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!deviceId || !from || !to) {
    return NextResponse.json(
      { error: "Missing deviceId, from or to" },
      { status: 400 }
    );
  }

  const auth = Buffer.from(`${email}:${password}`).toString("base64");

  const traccarUrl =
    `${url}/api/reports/trips?deviceId=${deviceId}` +
    `&from=${encodeURIComponent(from)}` +
    `&to=${encodeURIComponent(to)}`;

  const response = await fetch(traccarUrl, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      {
        error: "Failed to fetch Traccar trips",
        status: response.status,
      },
      { status: 500 }
    );
  }

  const trips = await response.json();

  return NextResponse.json({
    deviceId,
    from,
    to,
    totalTrips: trips.length,
    trips,
  });
}