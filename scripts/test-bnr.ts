import { getExchangeRates } from "../lib/data-sources/bnr";

async function main() {
  const rates = await getExchangeRates();

  console.log("\n=== BNR EXCHANGE RATES ===\n");

  for (const rate of rates) {
    console.log(
      `${rate.currency}: ${rate.rate}`,
    );
  }
}

main().catch((error) => {
  console.error("\n❌ BNR test failed:");
  console.error(error);
  process.exit(1);
});