"use client";

import { useEffect, useMemo } from "react";
import { getCurrencySymbol } from "@/lib/currency";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  MapPin,
  Navigation,
} from "lucide-react";

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

type UserLocation = {
  latitude: number;
  longitude: number;
};

type FuelMapProps = {
  stations: MapStation[];
  userLocation: UserLocation | null;
  currency: string;
};


function createPriceIcon(
  price: number | null,
  currency: string,
) {
  const symbol = getCurrencySymbol(currency);

  const text =
    price !== null
      ? `${price.toFixed(2)} ${symbol}`
      : "—";

  return L.divIcon({
    className: "fuel-marker-wrapper",
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

function MapCenter({
  location,
}: {
  location: UserLocation | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!location) {
      return;
    }

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
  }, [location, map]);

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

export function FuelMap({
  stations,
  userLocation,
  currency,
}: FuelMapProps) {
  const center = useMemo<
    [number, number]
  >(() => {
    if (stations.length > 0) {
      return [
        stations[0].latitude,
        stations[0].longitude,
      ];
    }

    return [44.4268, 26.1025];
  }, [stations]);

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={true}
      className="h-full min-h-0 w-full"
    >
      <MapCenter location={userLocation} />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {stations.map((station) => (
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
            <div className="w-[240px] p-1">
              {/* Station header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-slate-900">
                    {station.name}
                  </h3>

                  {station.brand && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      {station.brand}
                    </p>
                  )}
                </div>

                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <MapPin className="size-4" />
                </div>
              </div>

              {/* Location */}
              <div className="mt-3 flex items-center justify-between gap-3">
                {station.city && (
                  <span className="truncate text-xs text-slate-500">
                    {station.city}
                  </span>
                )}

                {station.distance !== null && (
                  <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-green-700">
                    <Navigation className="size-3" />

                    {formatDistance(
                      station.distance,
                    )}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Benzină 95
                </p>

                {station.price !== null ? (
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-bold tracking-tight text-slate-900">
                      {station.price.toFixed(
                        2,
                      )}
                    </span>

                    <span className="text-xs font-medium text-slate-500">
                      {currency}/L
                    </span>
                  </div>
                ) : (
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Preț indisponibil
                  </p>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}