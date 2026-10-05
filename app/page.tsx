import { db } from "@/lib/db";

import { FuelMapWrapper } from "@/components/map/fuel-map-wrapper";

export default async function MapPage() {
  const stations = await db.station.findMany({
    include: {
      brand: true,

      prices: {
        where: {
          fuelType: "GASOLINE_95",
        },

        orderBy: {
          observedAt: "desc",
        },

        take: 1,
      },
    },
  });

  const mapStations = stations.map(
    (station) => ({
      id: station.id,

      name: station.name,

      brand: station.brand?.name ?? null,

      city: station.city,

      latitude: Number(station.latitude),

      longitude: Number(station.longitude),

      price:
        station.prices.length > 0
          ? Number(station.prices[0].price)
          : null,
    }),
  );

  return (
    <main className="min-h-screen">
      <div className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              FuelRO
            </h1>

            <p className="text-sm text-gray-500">
              Stații de carburant
            </p>
          </div>

          <div className="text-sm text-gray-500">
            {mapStations.length} stații
          </div>
        </div>
      </div>

      <FuelMapWrapper
        stations={mapStations}
      />
    </main>
  );
}