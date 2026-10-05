import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

const allowedFuelTypes = [
  "GASOLINE_95",
  "GASOLINE_98",
  "DIESEL",
  "DIESEL_PREMIUM",
  "LPG",
] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const fuelParam =
      searchParams.get("fuel") ?? "GASOLINE_95";

    const fuel = allowedFuelTypes.includes(
      fuelParam as (typeof allowedFuelTypes)[number],
    )
      ? (fuelParam as (typeof allowedFuelTypes)[number])
      : "GASOLINE_95";

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

    const result = stations.map((station) => ({
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
    }));

    return NextResponse.json({
      stations: result,
      count: result.length,
      fuel,
    });
  } catch (error) {
    console.error(error);

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