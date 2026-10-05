import "dotenv/config";

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const db = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Seeding database...");

  // Branduri
  const petrom = await db.brand.upsert({
    where: {
      name: "Petrom",
    },
    update: {},
    create: {
      name: "Petrom",
    },
  });

  const omv = await db.brand.upsert({
    where: {
      name: "OMV",
    },
    update: {},
    create: {
      name: "OMV",
    },
  });

  // Stația Petrom
  const station1 = await db.station.create({
    data: {
      name: "Petrom București",
      externalId: "demo-petrom-1",
      brandId: petrom.id,

      address: "Bulevardul Unirii 1",
      city: "București",
      county: "București",

      latitude: 44.4268,
      longitude: 26.1025,

      prices: {
        create: [
          {
            fuelType: "GASOLINE_95",
            price: 8.59,
            source: "IMPORT",
            observedAt: new Date(),
          },
          {
            fuelType: "DIESEL",
            price: 9.67,
            source: "IMPORT",
            observedAt: new Date(),
          },
          {
            fuelType: "LPG",
            price: 4.23,
            source: "IMPORT",
            observedAt: new Date(),
          },
        ],
      },
    },
  });

  // Stația OMV
  const station2 = await db.station.create({
    data: {
      name: "OMV București",
      externalId: "demo-omv-1",
      brandId: omv.id,

      address: "Calea Victoriei 10",
      city: "București",
      county: "București",

      latitude: 44.4377,
      longitude: 26.0963,

      prices: {
        create: [
          {
            fuelType: "GASOLINE_95",
            price: 8.69,
            source: "IMPORT",
            observedAt: new Date(),
          },
          {
            fuelType: "DIESEL",
            price: 9.79,
            source: "IMPORT",
            observedAt: new Date(),
          },
        ],
      },
    },
  });

  console.log("Created stations:");
  console.log(station1.id);
  console.log(station2.id);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });