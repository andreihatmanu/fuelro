import fs from "node:fs";
import path from "node:path";

import { db } from "../lib/db";
import {
    getGasItemsByUat,
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

type FuelType =
    (typeof ANPC_PRODUCT_MAP)[keyof typeof ANPC_PRODUCT_MAP];

const CSV_PATH = path.join(
    process.cwd(),
    "data",
    "siruta_s1_2026.csv",
);

const START_INDEX = 0;
const TEST_LIMIT = 3181;

type Uat = {
    siruta: string;
    name: string;
};

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
        if (
            product.price === null ||
            product.price === undefined ||
            !Number.isFinite(product.price)
        ) {
            console.warn(
                `  ⚠️ ${fuelType}: produs fără preț la stația ${station.id}`,
            );

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

    for (const [
        productId,
        fuelType,
    ] of Object.entries(
        ANPC_PRODUCT_MAP,
    )) {
        await sleep(250);

        try {
            const result =
                await getGasItemsByUat({
                    uatId: uat.siruta,
                    productId,
                });

            const stations =
                result.Stations ?? [];

            const products =
                result.Products ?? [];

            if (products.length === 0) {
                continue;
            }

            console.log(
                `  ${productId} ${fuelType}: ${products.length} produse`,
            );

            for (const station of stations) {
                const stationProducts =
                    products.filter(
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
                    fuelType,
                );
            }
        } catch (error) {
            console.error(
                `  ❌ ${productId} ${fuelType}:`,
                error instanceof Error
                    ? error.message
                    : error,
            );
        }
    }
}

async function main() {
    const uats = loadUats();

    console.log(
        `UAT-uri găsite: ${uats.length}`,
    );

    const endIndex = Math.min(
        START_INDEX + TEST_LIMIT,
        uats.length,
    );

    console.log(
        `Import UAT ${START_INDEX + 1}-${endIndex}`,
    );

    for (
        let index = START_INDEX;
        index < endIndex;
        index++
    ) {
        const uat = uats[index];

        console.log(
            `\n[${index + 1}/${uats.length}]`,
        );

        await importUat(uat);
    }

    console.log(
        "\n=== IMPORT TERMINAT ===",
    );
}

main()
    .catch((error) => {
        console.error(
            "\n❌ Import failed:",
        );
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });