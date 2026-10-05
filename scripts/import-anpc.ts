process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { db } from "../lib/db";
import {
    getGasItemsByLatLon,
    type AnpcProduct,
    type AnpcStation,
} from "../lib/data-sources/anpc";

const ANPC_PRODUCT_MAP = {
    "11": "GASOLINE_95",
    "12": "GASOLINE_98",
    "21": "DIESEL",
    "22": "DIESEL_PREMIUM",
    "31": "LPG",
    "41": "ELECTRIC",
} as const;

type FuelType = (typeof ANPC_PRODUCT_MAP)[keyof typeof ANPC_PRODUCT_MAP];

function parseObservedAt(value: string): Date {
    const match = value.trim().match(
        /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/,
    );

    if (!match) {
        return new Date();
    }

    const [, day, month, year, hour, minute] = match;

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
        console.log(`⚠ ${station.id}: No Latitude and/or Longitude coordinates`);
        return;
    }

    const brandName =
        station.network?.name?.trim() || "Unknown";

    const brand = await db.brand.upsert({
        where: {
            name: brandName,
        },
        update: {
            logo: station.network?.logo?.logouri ?? undefined,
        },
        create: {
            name: brandName,
            logo: station.network?.logo?.logouri ?? null,
        },
    });

    const savedStation = await db.station.upsert({
        where: {
            externalId: station.id,
        },
        update: {
            name: station.name,
            brandId: brand.id,
            address: station.addr?.addrstring ?? null,
            postalCode: station.addr?.zipcode ?? null,
            latitude: location.Lat,
            longitude: location.Lon,
        },
        create: {
            externalId: station.id,
            name: station.name,
            brandId: brand.id,
            address: station.addr?.addrstring ?? null,
            city: null,
            county: null,
            postalCode: station.addr?.zipcode ?? null,
            latitude: location.Lat,
            longitude: location.Lon,
        },
    });

    const observedAt = parseObservedAt(
        station.updatedate,
    );

    for (const product of products) {
        const latestPrice = await db.fuelPrice.findFirst({
            where: {
                stationId: savedStation.id,
                fuelType,
            },
            orderBy: {
                observedAt: "desc",
            },
        });

        if (
            latestPrice &&
            Number(latestPrice.price) === product.price
        ) {
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

        console.log(
            `    💰 ${fuelType}: ${product.price} lei`,
        );
    }

    console.log(
        `  ✓ ${station.id} | ${station.name} | ${fuelType} | ${products.length} preț(uri)`,
    );
}

async function main() {
    const latitude = 47.15507753998551;
    const longitude = 27.590600962168537;
    const buffer = 5000;

    console.log("=== FuelRO — import ANPC ===");
    console.log(`Lat: ${latitude}`);
    console.log(`Lon: ${longitude}`);
    console.log(`Buffer: ${buffer}m\n`);

    for (const [productId, fuelType] of Object.entries(
        ANPC_PRODUCT_MAP,
    )) {
        console.log(
            `\n→ ${productId} = ${fuelType}`,
        );

        const result = await getGasItemsByLatLon({
            latitude,
            longitude,
            buffer,
            productId,
        });

        const stations = result.Stations ?? [];
        const products = result.Products ?? [];

        console.log(
            `  ANPC: ${stations.length} stații, ${products.length} produse`,
        );

        for (const station of stations) {
            const stationProducts = products.filter(
                (product) =>
                    product.stationid === station.id,
            );

            if (stationProducts.length === 0) {
                continue;
            }

            await importStation(
                station,
                stationProducts,
                fuelType,
            );
        }
    }

    console.log("\n=== Imported successfully ===");
}

main()
    .catch((error) => {
        console.error("\n❌ Import failed:");
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });