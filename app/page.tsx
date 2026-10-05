"use client";

import { useEffect, useState } from "react";

import { FuelMapWrapper } from "@/components/map/fuel-map-wrapper";
import type { MapStation } from "@/components/map/fuel-map";

import { devLocations } from "@/lib/dev/locations";

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

  const [stations, setStations] = useState<MapStation[]>(
    [],
  );

  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [locationError, setLocationError] =
    useState<string | null>(null);

  const [manualLocation, setManualLocation] =
    useState("");

  useEffect(() => {
    async function loadStations() {
      setLoading(true);

      try {
        const params = new URLSearchParams();

        params.set("fuel", fuel);

        if (location) {
          params.set(
            "lat",
            location.latitude.toString(),
          );

          params.set(
            "lng",
            location.longitude.toString(),
          );

          params.set("radius", "10");
        }

        const response = await fetch(
          `/api/stations?${params.toString()}`,
        );;

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

  function getUserLocation() {
    if (!navigator.geolocation) {
      setLocationError(
        "Browserul nu suportă geolocația.",
      );

      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLocationLoading(false);
      },
      (error) => {
        console.error(error);

        setLocationError(
          "Nu am putut obține locația.",
        );

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }

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

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              {loading
                ? "Se încarcă..."
                : `${stations.length} stații`}
            </div>

            <button
              type="button"
              onClick={getUserLocation}
              disabled={locationLoading}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {locationLoading
                ? "Se localizează..."
                : "📍 Locația mea"}
            </button>
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

      {/* Location */}
      {location && (
        <div className="border-b bg-green-50 px-6 py-3">
          <div className="mx-auto max-w-7xl text-sm text-green-800">
            Locația ta:{" "}
            {location.latitude.toFixed(5)},{" "}
            {location.longitude.toFixed(5)}
          </div>
        </div>
      )}

      {locationError && (
        <div className="border-b bg-red-50 px-6 py-3">
          <div className="mx-auto max-w-7xl text-sm text-red-700">
            {locationError}
          </div>
        </div>
      )}

      {process.env.NODE_ENV === "development" && (
        <div className="border-b bg-yellow-50 px-6 py-3">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <span className="text-sm font-medium text-yellow-800">
              Dev location:
            </span>

            <select
              value={manualLocation}
              onChange={(event) => {
                const selected =
                  devLocations.find(
                    (location) =>
                      location.name === event.target.value,
                  );

                setManualLocation(event.target.value);

                if (selected) {
                  setLocation({
                    latitude: selected.latitude,
                    longitude: selected.longitude,
                  });

                  setLocationError(null);
                }
              }}
              className="rounded-lg border border-yellow-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">
                Alege un oraș...
              </option>

              {devLocations.map((location) => (
                <option
                  key={location.name}
                  value={location.name}
                >
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Map */}
      {loading ? (
        <div className="flex h-[calc(100vh-137px)] min-h-[500px] items-center justify-center">
          <p className="text-sm text-gray-500">
            Se încarcă stațiile...
          </p>
        </div>
      ) : (
        <FuelMapWrapper stations={stations} userLocation={location} />
      )}
    </main>
  );
}