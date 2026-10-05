"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

          params.set("radius", "30");
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
          "Nu s-a putut obține locația.",
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

  useEffect(() => {
    getUserLocation();
  }, []);

  function handleDevLocation(
    value: string,
  ) {
    const selected = devLocations.find(
      (location) =>
        location.name === value,
    );

    setManualLocation(value);

    if (selected) {
      setLocation({
        latitude: selected.latitude,
        longitude: selected.longitude,
      });

      setLocationError(null);
    }
  }

  return (
    <main className="flex h-[100dvh] flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <header className="relative z-[1100] shrink-0 border-b bg-background">
        <div className="mx-auto flex min-h-16 max-w-[1600px] items-center justify-between gap-3 px-3 sm:px-6">
          {/* Logo */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-green-600 font-bold text-white shadow-sm sm:size-10">
              F
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">
                FuelRO
              </h1>

              <p className="hidden text-xs text-muted-foreground sm:block">
                Compară prețurile carburanților
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex min-w-0 items-center gap-2">
            {/* DEV */}
            {process.env.NODE_ENV ===
              "development" && (
                <select
                  value={manualLocation}
                  onChange={(event) =>
                    handleDevLocation(
                      event.target.value,
                    )
                  }
                  className="h-9 max-w-[100px] rounded-md border border-amber-300 bg-amber-50 px-2 text-xs font-medium text-amber-900 outline-none transition focus:ring-2 focus:ring-amber-200 sm:max-w-none sm:text-sm"
                >
                  <option value="">
                    🛠 Dev
                  </option>

                  {devLocations.map(
                    (location) => (
                      <option
                        key={location.name}
                        value={location.name}
                      >
                        {location.name}
                      </option>
                    ),
                  )}
                </select>
              )}

            {/* Station count */}
            <Badge
              variant="secondary"
              className="hidden h-9 px-3 text-sm md:inline-flex"
            >
              {loading ? "—" : stations.length}{" "}
              <span className="ml-1 font-normal text-muted-foreground">
                stații
              </span>
            </Badge>

            {/* Currency */}
            <CurrencySelector
              value={currency}
              onChange={setCurrency}
            />

            {/* Location */}
            <Button
              type="button"
              size="sm"
              onClick={getUserLocation}
              disabled={locationLoading}
              className="h-9 gap-1.5 bg-green-600 px-3 hover:bg-green-700 sm:px-4"
            >
              <MapPin className="size-4" />

              <span className="hidden sm:inline">
                {locationLoading
                  ? "Se localizează..."
                  : "Locația mea"}
              </span>

              <span className="sm:hidden">
                {locationLoading
                  ? "..."
                  : "Locație"}
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Fuel selector */}
      <div className="sticky top-0 z-[1050] shrink-0 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-[1600px] px-3 py-2 sm:px-6">
          <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {fuelTypes.map((fuelType) => {
              const active =
                fuel === fuelType.value;

              return (
                <Button
                  key={fuelType.value}
                  type="button"
                  variant={
                    active
                      ? "default"
                      : "ghost"
                  }
                  size="sm"
                  onClick={() =>
                    setFuel(
                      fuelType.value,
                    )
                  }
                  className={`shrink-0 whitespace-nowrap ${active
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "text-muted-foreground"
                    }`}
                >
                  {fuelType.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Location */}
      {location && (
        <div className="relative z-[1000] shrink-0 border-b border-green-100 bg-green-50">
          <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-3 py-1.5 text-xs text-green-800 sm:px-6 sm:text-sm">
            <MapPin className="size-3.5 shrink-0" />

            <span className="font-medium">
              Locația ta
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
        <div className="relative z-[1000] shrink-0 border-b border-red-100 bg-red-50">
          <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-3 py-1.5 text-xs text-red-700 sm:px-6 sm:text-sm">
            <span>⚠️</span>

            <span>{locationError}</span>
          </div>
        </div>
      )}

      {/* Map */}
      <section className="relative min-h-0 flex-1 overflow-hidden">
        {loading ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-slate-50">
            <LoaderCircle className="size-7 animate-spin text-green-600" />

            <p className="text-sm text-slate-500">
              {locationLoading
                ? "Se determină locația..."
                : "Se încarcă stațiile..."}
            </p>
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