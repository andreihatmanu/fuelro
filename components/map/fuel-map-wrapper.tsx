"use client";

import dynamic from "next/dynamic";

import type { MapStation } from "./fuel-map";

const FuelMap = dynamic(
  () =>
    import("./fuel-map").then(
      (module) => module.FuelMap,
    ),
  {
    ssr: false,

    loading: () => (
      <div className="flex h-[calc(100vh-80px)] min-h-[500px] items-center justify-center">
        <div className="text-sm text-gray-500">
          Map loading...
        </div>
      </div>
    ),
  },
);

type UserLocation = {
  latitude: number;
  longitude: number;
};

type FuelMapWrapperProps = {
  stations: MapStation[];
  userLocation: UserLocation | null;
};

export function FuelMapWrapper({
  stations,
  userLocation,
}: FuelMapWrapperProps) {
  return (
    <FuelMap
      stations={stations}
      userLocation={userLocation}
    />
  );
}