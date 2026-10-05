import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

const allowedFuelTypes = [
  "GASOLINE_95",
  "GASOLINE_98",
  "DIESEL",
  "DIESEL_PREMIUM",
  "LPG",
] as const;

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) {
  const earthRadiusKm = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLng =
    ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const fuelParam =
      searchParams.get("fuel") ?? "GASOLINE_95";

    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const radiusParam =
      searchParams.get("radius");

    const fuel = allowedFuelTypes.includes(
      fuelParam as (typeof allowedFuelTypes)[number],
    )
      ? (fuelParam as (typeof allowedFuelTypes)[number])
      : "GASOLINE_95";

    const latitude = latParam
      ? Number(latParam)
      : null;

    const longitude = lngParam
      ? Number(lngParam)
      : null;

    const radius = radiusParam
      ? Number(radiusParam)
      : 50;

    const stations = await db.station.findMany({
      include: {
        brand: true,

        prices: {
          where: {
            fuelType: fuel,
          },

          orderBy: {
            observedAt: "desc",
          },

          take: 1,
        },
      },

      orderBy: {
        name: "asc",
      },
    });

    let result = stations.map((station) => {
      const distance =
        latitude !== null &&
          longitude !== null
          ? calculateDistance(
            latitude,
            longitude,
            Number(station.latitude),
            Number(station.longitude),
          )
          : null;

      return {
        id: station.id,
        name: station.name,
        brand: station.brand?.name ?? null,
        city: station.city,
        county: station.county,
        latitude: Number(station.latitude),
        longitude: Number(station.longitude),

        price:
          station.prices.length > 0
            ? Number(station.prices[0].price)
            : null,

        observedAt:
          station.prices.length > 0
            ? station.prices[0].observedAt
            : null,

        distance,
      };
    });

    if (
      latitude !== null &&
      longitude !== null
    ) {
      result = result
        .filter(
          (station) =>
            station.distance !== null &&
            station.distance <= radius,
        )
        .sort(
          (a, b) =>
            (a.distance ?? Infinity) -
            (b.distance ?? Infinity),
        );
    }

    return NextResponse.json({
      stations: result,
      count: result.length,
      fuel,
      radius,
    });
  } catch (error) {
    console.error(
      "GET /api/stations error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Nu am putut încărca stațiile.",
      },
      {
        status: 500,
      },
    );
  }
}