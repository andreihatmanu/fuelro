import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

const allowedFuelTypes = [
  "GASOLINE_95",
  "GASOLINE_98",
  "DIESEL",
  "DIESEL_PREMIUM",
  "LPG",
] as const;

type FuelType =
  (typeof allowedFuelTypes)[number];

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
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );

  return earthRadiusKm * c;
}

function isValidNumber(
  value: number | null,
): value is number {
  return (
    value !== null &&
    Number.isFinite(value)
  );
}

export async function GET(
  request: NextRequest,
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const fuelParam =
      searchParams.get("fuel") ??
      "GASOLINE_95";

    const fuel: FuelType =
      allowedFuelTypes.includes(
        fuelParam as FuelType,
      )
        ? (fuelParam as FuelType)
        : "GASOLINE_95";

    /*
     * Viewport bounds
     */
    const northParam =
      searchParams.get("north");

    const southParam =
      searchParams.get("south");

    const eastParam =
      searchParams.get("east");

    const westParam =
      searchParams.get("west");

    const north = northParam
      ? Number(northParam)
      : null;

    const south = southParam
      ? Number(southParam)
      : null;

    const east = eastParam
      ? Number(eastParam)
      : null;

    const west = westParam
      ? Number(westParam)
      : null;

    const hasBounds =
      isValidNumber(north) &&
      isValidNumber(south) &&
      isValidNumber(east) &&
      isValidNumber(west);

    /*
     * User location.
     *
     * We use it only to calculate distance,
     * not to determine which stations are loaded.
     */
    const latParam =
      searchParams.get("lat");

    const lngParam =
      searchParams.get("lng");

    const latitude = latParam
      ? Number(latParam)
      : null;

    const longitude = lngParam
      ? Number(lngParam)
      : null;

    const hasUserLocation =
      isValidNumber(latitude) &&
      isValidNumber(longitude);

    /*
     * Optional radius fallback.
     *
     * This keeps the endpoint compatible with
     * the old API if bounds aren't supplied.
     */
    const radiusParam =
      searchParams.get("radius");

    const radius = radiusParam
      ? Number(radiusParam)
      : 50;

    /*
     * Build database filter.
     *
     * If bounds exist, PostgreSQL only returns
     * stations inside the visible map area.
     */
    const where = hasBounds
      ? {
        latitude: {
          gte: south,
          lte: north,
        },
        longitude: {
          gte: west,
          lte: east,
        },
      }
      : {};

    const stations =
      await db.station.findMany({
        where,

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

    let result = stations.map(
      (station) => {
        const stationLatitude =
          Number(station.latitude);

        const stationLongitude =
          Number(station.longitude);

        const distance =
          hasUserLocation
            ? calculateDistance(
              latitude,
              longitude,
              stationLatitude,
              stationLongitude,
            )
            : null;

        return {
          id: station.id,
          name: station.name,
          brand:
            station.brand?.name ?? null,
          city: station.city,
          county: station.county,

          latitude: stationLatitude,
          longitude: stationLongitude,

          price:
            station.prices.length > 0
              ? Number(
                station.prices[0].price,
              )
              : null,

          observedAt:
            station.prices.length > 0
              ? station.prices[0]
                .observedAt
              : null,

          distance,
        };
      },
    );

    /*
     * Old radius behavior.
     *
     * Only used if viewport bounds aren't
     * supplied.
     */
    if (
      !hasBounds &&
      hasUserLocation
    ) {
      result = result
        .filter(
          (station) =>
            station.distance !== null &&
            station.distance <= radius,
        )
        .sort(
          (a, b) =>
            (a.distance ??
              Infinity) -
            (b.distance ??
              Infinity),
        );
    }

    return NextResponse.json({
      stations: result,
      count: result.length,
      fuel,

      mode: hasBounds
        ? "viewport"
        : "radius",

      bounds: hasBounds
        ? {
          north,
          south,
          east,
          west,
        }
        : null,

      radius: hasBounds
        ? null
        : radius,
    });
  } catch (error) {
    console.error(
      "GET /api/stations error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Nu am putut încărca stațiile.",
      },
      {
        status: 500,
      },
    );
  }
}