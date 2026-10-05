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

type FuelMapWrapperProps = {
  stations: MapStation[];
};

export function FuelMapWrapper({
  stations,
}: FuelMapWrapperProps) {
  return <FuelMap stations={stations} />;
}