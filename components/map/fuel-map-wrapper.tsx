"use client";

import {
  useEffect,
  useState,
} from "react";

import dynamic from "next/dynamic";

import type {
  MapBounds,
  MapStation,
} from "./fuel-map";

const FuelMap = dynamic(
  () =>
    import("./fuel-map").then(
      (module) =>
        module.FuelMap,
    ),
  {
    ssr: false,

    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-sm text-slate-500">
          Se încarcă harta...
        </div>
      </div>
    ),
  },
);

type UserLocation = {
  latitude: number;
  longitude: number;
};

type ExchangeRate = {
  currency: string;
  rate: number;
};

type FuelMapWrapperProps = {
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

export function FuelMapWrapper({
  stations,
  userLocation,
  currency,
  onInitialBounds,
  onMapMove,
  onLocationMove,
}: FuelMapWrapperProps) {
  const [rates, setRates] =
    useState<ExchangeRate[]>([]);

  useEffect(() => {
    async function loadRates() {
      try {
        const response =
          await fetch(
            "/api/exchange-rates",
          );

        if (!response.ok) {
          throw new Error(
            `Exchange rates request failed: ${response.status}`,
          );
        }

        const data =
          await response.json();

        setRates(data);
      } catch (error) {
        console.error(
          "Failed to load exchange rates:",
          error,
        );
      }
    }

    loadRates();
  }, []);

  const convertedStations =
    stations.map((station) => {
      if (
        station.price === null ||
        currency === "RON"
      ) {
        return station;
      }

      const rate = rates.find(
        (item) =>
          item.currency ===
          currency,
      );

      if (!rate) {
        return station;
      }

      return {
        ...station,
        price:
          station.price /
          rate.rate,
      };
    });

  return (
    <div className="h-full w-full">
      <FuelMap
        stations={
          convertedStations
        }
        userLocation={
          userLocation
        }
        currency={currency}
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
    </div>
  );
}