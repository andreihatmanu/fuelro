"use client";

import { useMemo, useEffect } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
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
      [location.latitude, location.longitude],
      13,
      {
        duration: 1,
      },
    );
  }, [location, map]);

  return null;
}

export function FuelMap({ stations, userLocation, currency, }: FuelMapProps) {
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
              {station.distance !== null && (
                <p className="mt-1 text-sm font-medium text-green-700">
                  {station.distance < 1
                    ? `${Math.round(station.distance * 1000)} m`
                    : `${station.distance.toFixed(1)} km`}
                </p>
              )}

              <div className="mt-3 border-t pt-3">
                <p className="text-xs text-gray-500">
                  Benzină 95
                </p>

                <p className="text-lg font-bold">
                  {station.price !== null
                    ? `${station.price.toFixed(2)} ${currency}/L`
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