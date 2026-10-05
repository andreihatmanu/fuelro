"use client";

import { useEffect, useState } from "react";

import { FuelMapWrapper } from "@/components/map/fuel-map-wrapper";
import type { MapStation } from "@/components/map/fuel-map";

export default function MapPage() {
  const [stations, setStations] = useState<MapStation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStations() {
      try {
        const response = await fetch(
          "/api/stations?fuel=GASOLINE_95",
        );

        if (!response.ok) {
          throw new Error("Failed to load stations");
        }

        const data = await response.json();

        setStations(data.stations);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadStations();
  }, []);

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
            {loading
              ? "Se încarcă..."
              : `${stations.length} stații`}
          </div>
        </div>
      </div>

      {!loading && (
        <FuelMapWrapper stations={stations} />
      )}
    </main>
  );
}