"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import type { MapStation } from "./fuel-map";
import { CurrencySelector } from "../currency-selector";

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

type ExchangeRate = {
  currency: string;
  rate: number;
};

type FuelMapWrapperProps = {
  stations: MapStation[];
  userLocation: UserLocation | null;
};

export function FuelMapWrapper({
  stations,
  userLocation,
}: FuelMapWrapperProps) {
  const [currency, setCurrency] = useState("RON");
  const [rates, setRates] = useState<ExchangeRate[]>([]);

  useEffect(() => {
    async function loadRates() {
      try {
        const response = await fetch(
          "/api/exchange-rates",
        );

        if (!response.ok) {
          throw new Error(
            `Exchange rates request failed: ${response.status}`,
          );
        }

        const data = await response.json();

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

  const convertedStations = stations.map(
    (station) => {
      if (
        station.price === null ||
        currency === "RON"
      ) {
        return station;
      }

      const rate = rates.find(
        (item) => item.currency === currency,
      );

      if (!rate) {
        return station;
      }

      return {
        ...station,
        price: station.price / rate.rate,
      };
    },
  );

  return (
    <div className="relative">
      <div className="absolute right-4 top-4 z-[1000]">
        <CurrencySelector
          value={currency}
          onChange={setCurrency}
        />
      </div>

      <FuelMap
        stations={convertedStations}
        userLocation={userLocation}
        currency={currency}
      />
    </div>
  );
}