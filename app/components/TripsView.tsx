import type { Trip } from "@/lib/tripEngine";

type TripsViewProps = {
  trips: Trip[];
  formatDuration: (seconds: number) => string;
  formatDistance: (meters: number) => string;
};

export default function TripsView({
  trips,
  formatDuration,
  formatDistance,
}: TripsViewProps) {
      return (
    <main className="p-8 space-y-6">
      <h1 className="text-4xl font-bold">🚗 Trips</h1>

      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        {trips.length > 0 ? (
          <div className="space-y-3">
            {trips.slice(0, 20).map((trip, index) => (
              <div
                key={`${trip.deviceId}-${trip.startTime}-${index}`}
                className="bg-slate-800 rounded-lg p-4 text-sm"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <div className="font-semibold text-white">
                      {trip.deviceName}
                    </div>
                    <div className="text-slate-400 text-xs">
                      {new Date(trip.startTime).toLocaleString()} →{" "}
                      {new Date(trip.endTime).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {formatDistance(trip.distance)}
                    </div>
                    <div className="text-slate-400 text-xs">
                      {formatDuration(Math.floor(trip.duration / 1000))}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4 text-slate-300">
                  <div>
                    <div className="text-slate-500 text-xs">Van</div>
                    {trip.startAddress || "Onbekende startlocatie"}
                  </div>

                  <div>
                    <div className="text-slate-500 text-xs">Naar</div>
                    {trip.endAddress || "Onbekende eindlocatie"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-400">
            Geen trips gevonden voor deze tracker.
          </div>
        )}
      </section>
    </main>
  );
}