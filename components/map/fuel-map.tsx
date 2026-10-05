"use client";

import { useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

export type MapStation = {
  id: string;
  name: string;
  brand: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  price: number | null;
};

type FuelMapProps = {
  stations: MapStation[];
};

function createPriceIcon(price: number | null) {
  const text =
    price !== null
      ? `${price.toFixed(2)}`
      : "-";

  return L.divIcon({
    className: "fuel-marker-wrapper",
    html: `
      <div class="fuel-marker">
        <span>${text}</span>
      </div>
    `,
    iconSize: [64, 34],
    iconAnchor: [32, 17],
    popupAnchor: [0, -20],
  });
}

export function FuelMap({
  stations,
}: FuelMapProps) {
  const center = useMemo<[number, number]>(() => {
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
      className="h-[calc(100vh-80px)] min-h-[500px] w-full"
    >
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
          icon={createPriceIcon(station.price)}
        >
          <Popup>
            <div className="min-w-[180px]">
              <h3 className="text-base font-semibold">
                {station.name}
              </h3>

              {station.brand && (
                <p className="text-sm text-gray-500">
                  {station.brand}
                </p>
              )}

              {station.city && (
                <p className="mt-1 text-sm text-gray-500">
                  {station.city}
                </p>
              )}

              <div className="mt-3 border-t pt-3">
                <p className="text-xs text-gray-500">
                  Benzină 95
                </p>

                <p className="text-lg font-bold">
                  {station.price !== null
                    ? `${station.price.toFixed(2)} lei/L`
                    : "Preț indisponibil"}
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}