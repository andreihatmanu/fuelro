"use client";

import { useEffect, useState } from "react";

import { CurrencySelector } from "@/components/currency-selector";
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

  const [currency, setCurrency] = useState("RON");

  const [stations, setStations] = useState<MapStation[]>([]);

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
  }, [fuel, location]);

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
    <main className="flex h-[100dvh] flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <header className="relative z-[1100] border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[72px] max-w-[1600px] items-center justify-between gap-4 px-3 sm:px-6">
          {/* Brand */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-lg font-bold text-white shadow-sm">
              F
            </div>

            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                FuelRO
              </h1>

              <p className="hidden text-xs text-slate-500 sm:block">
                Compară prețurile carburanților
              </p>
            </div>
          </div>

          {/* Header controls */}
          <div className="flex min-w-0 items-center justify-end gap-2">
            {/* Development controls */}
            {process.env.NODE_ENV === "development" && (
              <>
                <div className="hidden items-center gap-2 sm:flex">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Dev
                  </span>

                  <select
                    value={manualLocation}
                    onChange={(event) => {
                      const selected =
                        devLocations.find(
                          (location) =>
                            location.name ===
                            event.target.value,
                        );

                      setManualLocation(
                        event.target.value,
                      );

                      if (selected) {
                        setLocation({
                          latitude:
                            selected.latitude,
                          longitude:
                            selected.longitude,
                        });

                        setLocationError(null);
                      }
                    }}
                    className="h-9 rounded-lg border border-amber-200 bg-amber-50 px-2.5 text-sm font-medium text-slate-700 outline-none transition hover:border-amber-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  >
                    <option value="">
                      Oraș...
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

                {/* Mobile dev selector */}
                <select
                  value={manualLocation}
                  onChange={(event) => {
                    const selected =
                      devLocations.find(
                        (location) =>
                          location.name ===
                          event.target.value,
                      );

                    setManualLocation(
                      event.target.value,
                    );

                    if (selected) {
                      setLocation({
                        latitude:
                          selected.latitude,
                        longitude:
                          selected.longitude,
                      });

                      setLocationError(null);
                    }
                  }}
                  className="h-9 max-w-[90px] rounded-lg border border-amber-200 bg-amber-50 px-2 text-xs font-medium text-slate-700 outline-none sm:hidden"
                >
                  <option value="">
                    Dev
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
              </>
            )}

            {/* Station count */}
            <div className="flex h-9 items-center rounded-lg bg-slate-100 px-3 text-sm">
              <span className="font-bold text-slate-900">
                {loading ? "—" : stations.length}
              </span>

              <span className="ml-1 text-slate-500">
                stații
              </span>
            </div>

            {/* Currency */}
            <CurrencySelector
              value={currency}
              onChange={setCurrency}
            />

            {/* User location */}
            <button
              type="button"
              onClick={getUserLocation}
              disabled={locationLoading}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-green-600 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
            >
              <span>📍</span>

              <span className="hidden sm:inline">
                {locationLoading
                  ? "Se localizează..."
                  : "Locația mea"}
              </span>

              <span className="sm:hidden">
                {locationLoading ? "..." : "Locație"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Fuel selector */}
      <div className="sticky top-0 z-[1050] border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-[1600px] px-3 py-2 sm:px-6">
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                  className={`min-h-9 shrink-0 rounded-lg px-3 text-xs font-medium transition-all sm:px-4 sm:text-sm ${active
                    ? "bg-white text-green-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
                    }`}
                >
                  {fuelType.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Location */}
      {location && (
        <div className="relative z-[1000] border-b border-green-100 bg-green-50">
          <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-3 py-1.5 text-xs text-green-800 sm:px-6 sm:text-sm">
            <span className="font-semibold">
              📍 Locația ta
            </span>

            <span className="text-green-700">
              {location.latitude.toFixed(5)},{" "}
              {location.longitude.toFixed(5)}
            </span>
          </div>
        </div>
      )}

      {/* Location error */}
      {locationError && (
        <div className="relative z-[1000] border-b border-red-100 bg-red-50">
          <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-3 py-1.5 text-xs text-red-700 sm:px-6 sm:text-sm">
            <span>⚠️</span>

            <span>{locationError}</span>
          </div>
        </div>
      )}

      {/* Map */}
      <section className="relative min-h-0 flex-1 overflow-hidden">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center bg-slate-100">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-green-600" />

              <p className="text-sm font-medium text-slate-500">
                Se încarcă stațiile...
              </p>
            </div>
          </div>
        ) : (
          <FuelMapWrapper
            stations={stations}
            userLocation={location}
            currency={currency}
          />
        )}
      </section>
    </main>
  );
}