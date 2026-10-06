"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  LoaderCircle,
  MapPin,
  Search,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { CurrencySelector } from "@/components/currency-selector";

import {
  LanguageSelector,
} from "@/components/language-selector";

import {
  FuelMapWrapper,
} from "@/components/map/fuel-map-wrapper";

import type {
  MapBounds,
  MapStation,
} from "@/components/map/fuel-map";

import { devLocations } from "@/lib/dev/locations";

const fuelTypes = [
  "GASOLINE_95",
  "GASOLINE_98",
  "DIESEL",
  "DIESEL_PREMIUM",
  "LPG",
] as const;

export default function MapPage() {
  const tHeader =
    useTranslations("Header");

  const tFuel =
    useTranslations("Fuel");

  const tMap =
    useTranslations("Map");

  const tLocation =
    useTranslations("Location");

  const [fuel, setFuel] =
    useState("GASOLINE_95");

  const [currency, setCurrency] =
    useState("RON");

  const [stations, setStations] =
    useState<MapStation[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [location, setLocation] =
    useState<{
      latitude: number;
      longitude: number;
    } | null>(null);

  const [locationLoading, setLocationLoading] =
    useState(true);

  const [locationError, setLocationError] =
    useState<string | null>(null);

  const [manualLocation, setManualLocation] =
    useState("");

  const [mapBounds, setMapBounds] =
    useState<MapBounds | null>(null);

  const [pendingBounds, setPendingBounds] =
    useState<MapBounds | null>(null);

  const initialBoundsRef =
    useRef<MapBounds | null>(null);

  const initialLoadRef =
    useRef(false);

  const loadStations = useCallback(
    async (bounds: MapBounds) => {
      setLoading(true);

      try {
        const params =
          new URLSearchParams();

        params.set(
          "fuel",
          fuel,
        );

        params.set(
          "north",
          bounds.north.toString(),
        );

        params.set(
          "south",
          bounds.south.toString(),
        );

        params.set(
          "east",
          bounds.east.toString(),
        );

        params.set(
          "west",
          bounds.west.toString(),
        );

        if (location) {
          params.set(
            "lat",
            location.latitude.toString(),
          );

          params.set(
            "lng",
            location.longitude.toString(),
          );
        }

        const response =
          await fetch(
            `/api/stations?${params.toString()}`,
          );

        if (!response.ok) {
          throw new Error(
            "Stations request failed",
          );
        }

        const data =
          await response.json();

        setStations(
          data.stations ?? [],
        );

        setMapBounds(bounds);
        setPendingBounds(null);
      } catch (error) {
        console.error(error);
        setStations([]);
      } finally {
        setLoading(false);
      }
    },
    [fuel, location],
  );

  const handleInitialBounds =
    useCallback(
      (bounds: MapBounds) => {
        initialBoundsRef.current =
          bounds;

        setMapBounds(
          (current) =>
            current ?? bounds,
        );

        if (
          !initialLoadRef.current &&
          !locationLoading
        ) {
          initialLoadRef.current =
            true;

          void loadStations(
            bounds,
          );
        }
      },
      [
        loadStations,
        locationLoading,
      ],
    );

  const handleMapMove =
    useCallback(
      (bounds: MapBounds) => {
        setPendingBounds(bounds);
      },
      [],
    );

  const handleLocationMove =
    useCallback(
      (bounds: MapBounds) => {
        setPendingBounds(null);

        void loadStations(
          bounds,
        );
      },
      [loadStations],
    );

  const getUserLocation =
    useCallback(() => {
      if (
        !navigator.geolocation
      ) {
        setLocationError(
          tLocation(
            "notSupported",
          ),
        );

        setLocationLoading(
          false,
        );

        return;
      }

      setLocationLoading(true);
      setLocationError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude:
              position.coords
                .latitude,

            longitude:
              position.coords
                .longitude,
          });

          setLocationLoading(
            false,
          );
        },

        (error) => {
          console.error(error);

          setLocationError(
            tLocation("failed"),
          );

          setLocationLoading(
            false,
          );

          if (
            initialBoundsRef.current &&
            !initialLoadRef.current
          ) {
            initialLoadRef.current =
              true;

            void loadStations(
              initialBoundsRef.current,
            );
          }
        },

        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      );
    }, [loadStations, tLocation]);

  /*
   * Automatic location.
   *
   * Important:
   * We intentionally don't put getUserLocation
   * in the dependency array because it depends
   * on location/fuel.
   */
  useEffect(() => {
    getUserLocation();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * When fuel changes, reload the current
   * searched viewport.
   */
  useEffect(() => {
    if (!mapBounds) {
      return;
    }

    void loadStations(
      mapBounds,
    );
  }, [fuel]);

  function handleDevLocation(
    value: string,
  ) {
    const selected =
      devLocations.find(
        (item) =>
          item.name === value,
      );

    setManualLocation(value);

    if (selected) {
      setLocation({
        latitude:
          selected.latitude,
        longitude:
          selected.longitude,
      });

      setLocationError(null);

      setMapBounds(null);
      setPendingBounds(null);
    }
  }

  function searchPendingArea() {
    if (!pendingBounds) {
      return;
    }

    void loadStations(
      pendingBounds,
    );
  }

  return (
    <main className="flex h-[100dvh] flex-col overflow-hidden bg-slate-50">
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
                {tHeader(
                  "subtitle",
                )}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex min-w-0 items-center gap-2">
            {process.env
              .NODE_ENV ===
              "development" && (
                <select
                  value={
                    manualLocation
                  }
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
                    (item) => (
                      <option
                        key={item.name}
                        value={item.name}
                      >
                        {item.name}
                      </option>
                    ),
                  )}
                </select>
              )}

            <Badge
              variant="secondary"
              className="hidden h-9 px-3 text-sm md:inline-flex"
            >
              {loading
                ? "—"
                : stations.length}

              <span className="ml-1 font-normal text-muted-foreground">
                {tHeader(
                  "stations",
                )}
              </span>
            </Badge>

            <CurrencySelector
              value={currency}
              onChange={
                setCurrency
              }
            />

            <LanguageSelector />

            <Button
              type="button"
              size="sm"
              onClick={
                getUserLocation
              }
              disabled={
                locationLoading
              }
              className="h-9 gap-1.5 bg-green-600 px-3 hover:bg-green-700 sm:px-4"
            >
              <MapPin className="size-4" />

              <span className="hidden sm:inline">
                {locationLoading
                  ? tHeader(
                    "locating",
                  )
                  : tHeader(
                    "myLocation",
                  )}
              </span>

              <span className="sm:hidden">
                {locationLoading
                  ? "..."
                  : "GPS"}
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Fuel selector */}
      <div className="sticky top-0 z-[1050] shrink-0 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-[1600px] px-3 py-2 sm:px-6">
          <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {fuelTypes.map(
              (fuelType) => {
                const active =
                  fuel === fuelType;

                return (
                  <Button
                    key={fuelType}
                    type="button"
                    variant={
                      active
                        ? "default"
                        : "ghost"
                    }
                    size="sm"
                    onClick={() =>
                      setFuel(
                        fuelType,
                      )
                    }
                    className={`shrink-0 whitespace-nowrap ${active
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "text-muted-foreground"
                      }`}
                  >
                    {tFuel(
                      fuelType,
                    )}
                  </Button>
                );
              },
            )}
          </div>
        </div>
      </div>

      {/* Location */}
      {location && (
        <div className="relative z-[1000] shrink-0 border-b border-green-100 bg-green-50">
          <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-3 py-1.5 text-xs text-green-800 sm:px-6 sm:text-sm">
            <MapPin className="size-3.5 shrink-0" />

            <span className="font-medium">
              {tMap(
                "yourLocation",
              )}
            </span>

            <span className="text-green-700">
              {location.latitude.toFixed(
                5,
              )}
              ,{" "}
              {location.longitude.toFixed(
                5,
              )}
            </span>
          </div>
        </div>
      )}

      {/* Location error */}
      {locationError && (
        <div className="relative z-[1000] shrink-0 border-b border-red-100 bg-red-50">
          <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-3 py-1.5 text-xs text-red-700 sm:px-6 sm:text-sm">
            <span>⚠️</span>

            <span>
              {locationError}
            </span>
          </div>
        </div>
      )}

      {/* Map */}
      <section className="relative min-h-0 flex-1 overflow-hidden">
        <FuelMapWrapper
          stations={stations}
          userLocation={location}
          currency={currency}
          onInitialBounds={
            handleInitialBounds
          }
          onMapMove={
            handleMapMove
          }
          onLocationMove={
            handleLocationMove
          }
        />

        {loading && (
          <div className="pointer-events-none absolute inset-0 z-[900] flex items-center justify-center bg-white/20 backdrop-blur-[1px]">
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-lg ring-1 ring-slate-200">
              <LoaderCircle className="size-4 animate-spin text-green-600" />

              <span>
                {tMap(
                  "loadingStations",
                )}
              </span>
            </div>
          </div>
        )}

        {pendingBounds && (
          <div className="pointer-events-none absolute inset-x-0 top-4 z-[1000] flex justify-center px-4">
            <Button
              type="button"
              size="sm"
              onClick={
                searchPendingArea
              }
              className="pointer-events-auto gap-2 rounded-full bg-white px-4 text-slate-900 shadow-lg ring-1 ring-slate-200 hover:bg-slate-50"
            >
              <Search className="size-4 text-green-600" />

              <span>
                {tMap(
                  "searchArea",
                )}
              </span>
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}