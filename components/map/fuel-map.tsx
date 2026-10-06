"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Apple,
  MapPin,
  Navigation,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  getCurrencySymbol,
} from "@/lib/currency";

import "leaflet/dist/leaflet.css";

export type MapStation = {
  id: string;
  name: string;
  brand: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  price: number | null;
  distance: number | null;
};

export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

type UserLocation = {
  latitude: number;
  longitude: number;
};

type FuelMapProps = {
  stations: MapStation[];
  userLocation:
    | UserLocation
    | null;
  currency: string;

  onInitialBounds?: (
    bounds: MapBounds,
  ) => void;

  onMapMove?: (
    bounds: MapBounds,
  ) => void;

  onLocationMove?: (
    bounds: MapBounds,
  ) => void;
};

function getMapBounds(
  map: L.Map,
): MapBounds {
  const bounds =
    map.getBounds();

  return {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  };
}

function createPriceIcon(
  price: number | null,
  currency: string,
) {
  const symbol =
    getCurrencySymbol(currency);

  const text =
    price !== null
      ? `${price.toFixed(2)} ${symbol}`
      : "—";

  return L.divIcon({
    className:
      "fuel-marker-wrapper",

    html: `
      <div class="fuel-marker">
        <span class="fuel-marker-price">
          ${text}
        </span>
      </div>
    `,

    iconSize: [90, 38],
    iconAnchor: [45, 19],
    popupAnchor: [0, -23],
  });
}

function MapViewportController({
  location,
  onInitialBounds,
  onMapMove,
  onLocationMove,
}: {
  location:
    | UserLocation
    | null;

  onInitialBounds?: (
    bounds: MapBounds,
  ) => void;

  onMapMove?: (
    bounds: MapBounds,
  ) => void;

  onLocationMove?: (
    bounds: MapBounds,
  ) => void;
}) {
  const map = useMap();

  const initialReportedRef =
    useRef(false);

  const programmaticMoveRef =
    useRef(false);

  const previousLocationRef =
    useRef<UserLocation | null>(
      null,
    );

  useEffect(() => {
    if (
      initialReportedRef.current
    ) {
      return;
    }

    initialReportedRef.current =
      true;

    onInitialBounds?.(
      getMapBounds(map),
    );
  }, [
    map,
    onInitialBounds,
  ]);

  useMapEvents({
    moveend() {
      const bounds =
        getMapBounds(map);

      if (
        programmaticMoveRef.current
      ) {
        programmaticMoveRef.current =
          false;

        onLocationMove?.(
          bounds,
        );

        return;
      }

      onMapMove?.(bounds);
    },
  });

  useEffect(() => {
    if (!location) {
      return;
    }

    const previous =
      previousLocationRef.current;

    const sameLocation =
      previous?.latitude ===
        location.latitude &&
      previous?.longitude ===
        location.longitude;

    if (sameLocation) {
      return;
    }

    previousLocationRef.current =
      location;

    programmaticMoveRef.current =
      true;

    map.flyTo(
      [
        location.latitude,
        location.longitude,
      ],
      13,
      {
        duration: 1,
      },
    );
  }, [
    location,
    map,
  ]);

  return null;
}

function formatDistance(
  distance: number,
) {
  if (distance < 1) {
    return `${Math.round(
      distance * 1000,
    )} m`;
  }

  return `${distance.toFixed(1)} km`;
}

function openDirections(
  provider:
    | "google"
    | "apple"
    | "waze",
  latitude: number,
  longitude: number,
) {
  let url = "";

  switch (provider) {
    case "google":
      url =
        `https://www.google.com/maps/dir/?api=1` +
        `&destination=${latitude},${longitude}`;
      break;

    case "apple":
      url =
        `https://maps.apple.com/?daddr=` +
        `${latitude},${longitude}&dirflg=d`;
      break;

    case "waze":
      url =
        `https://waze.com/ul?ll=` +
        `${latitude},${longitude}&navigate=yes`;
      break;
  }

  window.open(
    url,
    "_blank",
    "noopener,noreferrer",
  );
}

function StationPopup({
  station,
  currency,
}: {
  station: MapStation;
  currency: string;
}) {
  const t =
    useTranslations("Map");

  const symbol =
    getCurrencySymbol(currency);

  const [
    showDirections,
    setShowDirections,
  ] = useState(false);

  return (
    <Card className="w-[270px] border-0 shadow-none">
      <CardContent className="p-0">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <MapPin className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-slate-900">
              {station.name}
            </h3>

            {station.brand && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {station.brand}
              </p>
            )}
          </div>
        </div>

        {(station.city ||
          station.distance !==
            null) && (
          <div className="mt-3 flex items-center gap-2">
            {station.city && (
              <Badge
                variant="secondary"
                className="max-w-[150px] truncate font-normal"
              >
                {station.city}
              </Badge>
            )}

            {station.distance !==
              null && (
              <Badge
                variant="outline"
                className="shrink-0 gap-1 font-medium text-green-700"
              >
                <Navigation className="size-3" />

                {formatDistance(
                  station.distance,
                )}
              </Badge>
            )}
          </div>
        )}

        <Separator className="my-3" />

        <div className="rounded-xl bg-green-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-green-800">
              {/*
                Fuel type is currently fixed to
                gasoline 95 in the popup.
              */}
              Benzină 95
            </span>

            <Badge
              variant="outline"
              className="border-green-200 bg-white text-[10px] text-green-700"
            >
              {t("price")}
            </Badge>
          </div>

          {station.price !==
          null ? (
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {station.price.toFixed(
                  2,
                )}
              </span>

              <span className="text-sm font-semibold text-slate-500">
                {symbol}/L
              </span>
            </div>
          ) : (
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              {t(
                "priceUnavailable",
              )}
            </p>
          )}
        </div>

        <div className="mt-3">
          <Button
            type="button"
            size="sm"
            className="w-full gap-2 bg-green-600 text-white hover:bg-green-700"
            onClick={() =>
              setShowDirections(
                (current) =>
                  !current,
              )
            }
          >
            <Navigation className="size-4 shrink-0" />

            <span>
              {showDirections
                ? t("close")
                : t("directions")}
            </span>
          </Button>

          {showDirections && (
            <div className="mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                {t(
                  "chooseNavigation",
                )}
              </p>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto flex-col gap-1 rounded-lg px-2 py-2"
                  onClick={() =>
                    openDirections(
                      "google",
                      station.latitude,
                      station.longitude,
                    )
                  }
                >
                  <span className="flex size-7 items-center justify-center rounded-md bg-slate-100 text-xs font-bold">
                    G
                  </span>

                  <span className="text-[11px]">
                    {t("google")}
                  </span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-auto flex-col gap-1 rounded-lg px-2 py-2"
                  onClick={() =>
                    openDirections(
                      "apple",
                      station.latitude,
                      station.longitude,
                    )
                  }
                >
                  <span className="flex size-7 items-center justify-center rounded-md bg-slate-100">
                    <Apple className="size-4" />
                  </span>

                  <span className="text-[11px]">
                    {t("apple")}
                  </span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-auto flex-col gap-1 rounded-lg px-2 py-2"
                  onClick={() =>
                    openDirections(
                      "waze",
                      station.latitude,
                      station.longitude,
                    )
                  }
                >
                  <span className="flex size-7 items-center justify-center rounded-md bg-slate-100 text-xs font-bold">
                    W
                  </span>

                  <span className="text-[11px]">
                    {t("waze")}
                  </span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function FuelMap({
  stations,
  userLocation,
  currency,
  onInitialBounds,
  onMapMove,
  onLocationMove,
}: FuelMapProps) {
  const center = useMemo<
    [number, number]
  >(() => {
    if (userLocation) {
      return [
        userLocation.latitude,
        userLocation.longitude,
      ];
    }

    if (
      stations.length > 0
    ) {
      return [
        stations[0].latitude,
        stations[0].longitude,
      ];
    }

    return [
      44.4268,
      26.1025,
    ];
  }, [
    stations,
    userLocation,
  ]);

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={true}
      className="h-full min-h-0 w-full"
    >
      <MapViewportController
        location={userLocation}
        onInitialBounds={
          onInitialBounds
        }
        onMapMove={
          onMapMove
        }
        onLocationMove={
          onLocationMove
        }
      />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {stations.map(
        (station) => (
          <Marker
            key={station.id}
            position={[
              station.latitude,
              station.longitude,
            ]}
            icon={createPriceIcon(
              station.price,
              currency,
            )}
          >
            <Popup
              closeButton={true}
              className="fuel-popup"
            >
              <StationPopup
                station={station}
                currency={currency}
              />
            </Popup>
          </Marker>
        ),
      )}
    </MapContainer>
  );
}