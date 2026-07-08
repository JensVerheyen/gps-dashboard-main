export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string> {
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
const houseNumber = address.house_number ?? "";
const postcode = address.postcode ?? "";
const city =
  address.city ??
  address.town ??
  address.village ??
  "";

return [road + (houseNumber ? ` ${houseNumber}` : ""), `${postcode} ${city}`]
  .filter(Boolean)
  .join(", ");

} catch (error) {
    console.error("Reverse geocoding failed:", error);
    return "Onbekende locatie";
  }
}