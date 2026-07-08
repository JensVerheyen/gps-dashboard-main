const locationCache = new Map<string, string>();

function cacheKey(lat: number, lon: number) {
  return `${lat.toFixed(5)},${lon.toFixed(5)}`;
}

export async function getLocation(
  latitude: number,
  longitude: number
): Promise<string> {
  const key = cacheKey(latitude, longitude);

  if (locationCache.has(key)) {
    return locationCache.get(key)!;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "nl",
        },
      }
    );

    if (!response.ok) {
      return "Onbekende locatie";
    }

    const data = await response.json();

    const address = data.address;

    const road = address.road ?? "";
    const number = address.house_number ?? "";
    const postcode = address.postcode ?? "";
    const city =
      address.city ??
      address.town ??
      address.village ??
      "";

    const result = [
      road + (number ? ` ${number}` : ""),
      `${postcode} ${city}`,
    ]
      .filter(Boolean)
      .join(", ");

    locationCache.set(key, result);

    return result;
  } catch (error) {
    console.error(error);

    return "Onbekende locatie";
  }
}