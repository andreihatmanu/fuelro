"use client";

import { useEffect, useState } from "react";

import { FuelMapWrapper } from "@/components/map/fuel-map-wrapper";
import type { MapStation } from "@/components/map/fuel-map";

const fuelTypes = [
  {
    value: "GASOLINE_95",
    label: "Benzină 95",
  },
  {
    value: "GASOLINE_98",
    label: "Benzină 98",
  },
  {
    value: "DIESEL",
    label: "Diesel",
  },
  {
    value: "DIESEL_PREMIUM",
    label: "Diesel Premium",
  },
  {
    value: "LPG",
    label: "GPL",
  },
];

export default function MapPage() {
  const [fuel, setFuel] = useState("GASOLINE_95");
  const [stations, setStations] = useState<MapStation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStations() {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/stations?fuel=${fuel}`,
        );

        if (!response.ok) {
          throw new Error(
            "Nu s-au putut încărca stațiile.",
          );
        }

        const data = await response.json();

        setStations(data.stations);
      } catch (error) {
        console.error(error);
        setStations([]);
      } finally {
        setLoading(false);
      }
    }

    loadStations();
  }, [fuel]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              FuelRO
            </h1>

            <p className="text-sm text-gray-500">
              Compară prețurile carburanților
            </p>
          </div>

          <div className="text-sm text-gray-500">
            {loading
              ? "Se încarcă..."
              : `${stations.length} stații`}
          </div>
        </div>
      </div>

      {/* Fuel selector */}
      <div className="border-b bg-white px-6 py-3">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
          {fuelTypes.map((fuelType) => {
            const active =
              fuel === fuelType.value;

            return (
              <button
                key={fuelType.value}
                type="button"
                onClick={() =>
                  setFuel(fuelType.value)
                }
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${active
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {fuelType.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map */}
      {loading ? (
        <div className="flex h-[calc(100vh-137px)] min-h-[500px] items-center justify-center">
          <p className="text-sm text-gray-500">
            Se încarcă stațiile...
          </p>
        </div>
      ) : (
        <FuelMapWrapper stations={stations} />
      )}
    </main>
  );
}