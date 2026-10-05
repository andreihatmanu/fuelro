import { db } from "../lib/db";
import { getExchangeRates } from "../lib/data-sources/bnr";

async function main() {
  const rates = await getExchangeRates();

  const today = new Date();

  // Păstrăm doar data, fără ora exactă
  const date = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  console.log(`\n=== IMPORT BNR ${date.toISOString().slice(0, 10)} ===\n`);

  for (const rate of rates) {
    await db.exchangeRate.upsert({
      where: {
        currency_date: {
          currency: rate.currency,
          date,
        },
      },
      update: {
        rate: rate.rate,
      },
      create: {
        currency: rate.currency,
        rate: rate.rate,
        date,
      },
    });

    console.log(`${rate.currency}: ${rate.rate}`);
  }

  console.log(`\n✓ ${rates.length} cursuri salvate.`);
}

main()
  .catch((error) => {
    console.error("\n❌ Import BNR eșuat:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });