import fs from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  getGasItemsByUat,
  type AnpcProduct,
  type AnpcStation,
} from "@/lib/data-sources/anpc";

const ANPC_PRODUCT_MAP = {
  "11": "GASOLINE_95",
  "12": "GASOLINE_98",
  "21": "DIESEL",
  "22": "DIESEL_PREMIUM",
  "31": "LPG",
  "41": "ELECTRIC",
} as const;

type FuelType =
  (typeof ANPC_PRODUCT_MAP)[keyof typeof ANPC_PRODUCT_MAP];

type Uat = {
  siruta: string;
  name: string;
};

const CSV_PATH = path.join(
  process.cwd(),
  "data",
  "siruta_s1_2026.csv",
);

const BATCH_SIZE = 50;

function sleep(ms: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms),
  );
}

function loadUats(): Uat[] {
  const csv = fs.readFileSync(
    CSV_PATH,
    "utf8",
  );

  const lines = csv
    .split(/\r?\n/)
    .filter(Boolean);

  return lines
    .slice(1)
    .map((line) => line.split(";"))
    .filter(
      (columns) => columns.length >= 12,
    )
    .map((columns) => ({
      siruta: columns[0].trim(),
      name: columns[1].trim(),
      level: columns[6].trim(),
    }))
    .filter((uat) => uat.level === "2")
    .map((uat) => ({
      siruta: uat.siruta,
      name: uat.name,
    }));
}

function parseObservedAt(
  value: string,
): Date {
  const match = value
    .trim()
    .match(
      /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/,
    );

  if (!match) {
    return new Date();
  }

  const [
    ,
    day,
    month,
    year,
    hour,
    minute,
  ] = match;

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );
}

async function importStation(
  station: AnpcStation,
  products: AnpcProduct[],
  fuelType: FuelType,
) {
  const location = station.addr?.location;

  if (!location) {
    return;
  }

  const brandName =
    station.network?.name?.trim() ||
    "Unknown";

  const brand = await db.brand.upsert({
    where: {
      name: brandName,
    },
    update: {
      logo:
        station.network?.logo?.logouri ??
        undefined,
    },
    create: {
      name: brandName,
      logo:
        station.network?.logo?.logouri ??
        null,
    },
  });

  const savedStation =
    await db.station.upsert({
      where: {
        externalId: station.id,
      },
      update: {
        name: station.name,
        brandId: brand.id,
        address:
          station.addr?.addrstring ??
          null,
        postalCode:
          station.addr?.zipcode ??
          null,
        latitude: location.Lat,
        longitude: location.Lon,
      },
      create: {
        externalId: station.id,
        name: station.name,
        brandId: brand.id,
        address:
          station.addr?.addrstring ??
          null,
        city: null,
        county: null,
        postalCode:
          station.addr?.zipcode ??
          null,
        latitude: location.Lat,
        longitude: location.Lon,
      },
    });

  const observedAt =
    parseObservedAt(
      station.updatedate,
    );

  for (const product of products) {
    // Unele produse, în special ELECTRIC,
    // pot veni fără preț.
    if (
      product.price === null ||
      product.price === undefined ||
      !Number.isFinite(product.price)
    ) {
      continue;
    }

    const existingPrice =
      await db.fuelPrice.findUnique({
        where: {
          stationId_fuelType_observedAt: {
            stationId: savedStation.id,
            fuelType,
            observedAt,
          },
        },
      });

    if (existingPrice) {
      if (
        Number(existingPrice.price) !==
        product.price
      ) {
        await db.fuelPrice.update({
          where: {
            id: existingPrice.id,
          },
          data: {
            price: product.price,
          },
        });
      }

      continue;
    }

    await db.fuelPrice.create({
      data: {
        stationId: savedStation.id,
        fuelType,
        price: product.price,
        source: "ANPC",
        observedAt,
      },
    });
  }
}

async function importUat(
  uat: Uat,
) {
  console.log(
    `\n=== ${uat.name} (${uat.siruta}) ===`,
  );

  /*
   * Cele 6 categorii sunt cerute în paralel.
   * Astfel nu mai așteptăm 250ms + request
   * pentru fiecare categorie una după alta.
   */
  const results = await Promise.all(
    Object.entries(
      ANPC_PRODUCT_MAP,
    ).map(
      async ([productId, fuelType]) => {
        try {
          await sleep(100);

          const result =
            await getGasItemsByUat({
              uatId: uat.siruta,
              productId,
            });

          return {
            productId,
            fuelType,
            stations:
              result.Stations ?? [],
            products:
              result.Products ?? [],
          };
        } catch (error) {
          console.error(
            `❌ ${uat.name} / ${productId} ${fuelType}:`,
            error instanceof Error
              ? error.message
              : error,
          );

          return null;
        }
      },
    ),
  );

  for (const result of results) {
    if (!result) {
      continue;
    }

    if (
      result.products.length === 0
    ) {
      continue;
    }

    console.log(
      `  ${result.productId} ${result.fuelType}: ${result.products.length} produse`,
    );

    for (const station of result.stations) {
      const stationProducts =
        result.products.filter(
          (product) =>
            product.stationid ===
            station.id,
        );

      if (
        stationProducts.length === 0
      ) {
        continue;
      }

      await importStation(
        station,
        stationProducts,
        result.fuelType,
      );
    }
  }
}

export async function GET() {
  try {
    const uats = loadUats();

    const state =
      await db.importState.upsert({
        where: {
          id: "fuel-prices",
        },
        update: {},
        create: {
          id: "fuel-prices",
          currentIndex: 0,
        },
      });

    const startIndex =
      state.currentIndex;

    // Am ajuns la finalul României.
    if (startIndex >= uats.length) {
      await db.importState.update({
        where: {
          id: "fuel-prices",
        },
        data: {
          currentIndex: 0,
        },
      });

      return NextResponse.json({
        success: true,
        message:
          "Import complet. Cursor resetat la 0.",
        total: uats.length,
      });
    }

    const endIndex = Math.min(
      startIndex + BATCH_SIZE,
      uats.length,
    );

    const batch = uats.slice(
      startIndex,
      endIndex,
    );

    console.log(
      `\n=== FUEL IMPORT ===`,
    );

    console.log(
      `UAT ${startIndex + 1}-${endIndex} / ${uats.length}`,
    );

    for (const uat of batch) {
      await importUat(uat);
    }

    // Salvăm progresul DOAR după ce batch-ul
    // s-a terminat.
    await db.importState.update({
      where: {
        id: "fuel-prices",
      },
      data: {
        currentIndex: endIndex,
      },
    });

    return NextResponse.json({
      success: true,
      processed: batch.length,
      from: startIndex,
      to: endIndex,
      total: uats.length,
      nextIndex: endIndex,
      completed: endIndex >= uats.length,
    });
  } catch (error) {
    console.error(
      "Fuel price cron failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Fuel price update failed",
      },
      {
        status: 500,
      },
    );
  } finally {
    await db.$disconnect();
  }
}