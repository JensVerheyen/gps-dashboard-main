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
    `${url}/api/reports/route?deviceId=${deviceId}` +
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
        error: "Failed to fetch Traccar history",
        status: response.status,
      },
      { status: 500 }
    );
  }

  const positions = await response.json();

  const movingPositions = positions.filter(
    (position: any) =>
      position.attributes?.motion === true || (position.speed ?? 0) > 0
  );

  const lastMovingPosition =
    movingPositions.length > 0
      ? movingPositions[movingPositions.length - 1]
      : null;

const validPositions = positions.filter(
  (position: any) =>
    position.valid === true &&
    position.latitude !== 0 &&
    position.longitude !== 0
);

const lastValidPosition =
  validPositions.length > 0
    ? validPositions[validPositions.length - 1]
    : null;

return NextResponse.json({
  deviceId,
  from,
  to,
  totalPositions: positions.length,

  lastMovingTime:
    lastMovingPosition?.deviceTime ??
    lastMovingPosition?.fixTime ??
    lastMovingPosition?.serverTime ??
    null,

  lastMovingPosition,

  lastValidPositionTime:
    lastValidPosition?.deviceTime ??
    lastValidPosition?.fixTime ??
    lastValidPosition?.serverTime ??
    null,

  lastValidPosition,
});
}