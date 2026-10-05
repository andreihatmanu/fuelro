import { db } from "../lib/db";

async function main() {
  const prices = await db.fuelPrice.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });

  const seen = new Set<string>();
  const duplicateIds: string[] = [];

  for (const price of prices) {
    const key = [
      price.stationId,
      price.fuelType,
      price.observedAt.toISOString(),
    ].join("|");

    if (seen.has(key)) {
      duplicateIds.push(price.id);
    } else {
      seen.add(key);
    }
  }

  console.log(`Prețuri totale: ${prices.length}`);
  console.log(`Duplicate găsite: ${duplicateIds.length}`);

  if (duplicateIds.length > 0) {
    await db.fuelPrice.deleteMany({
      where: {
        id: {
          in: duplicateIds,
        },
      },
    });
  }

  console.log("Curățare terminată.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });