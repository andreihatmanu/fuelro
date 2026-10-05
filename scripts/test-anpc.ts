import { getGasItemsByUat } from "../lib/data-sources/anpc";

const ANPC_PRODUCT_MAP = {
  "11": "GASOLINE_95",
  "12": "GASOLINE_98",
  "21": "DIESEL",
  "22": "DIESEL_PREMIUM",
  "31": "LPG",
  "41": "ELECTRIC",
} as const;

async function main() {
  for (const [productId, fuelType] of Object.entries(
    ANPC_PRODUCT_MAP,
  )) {
    try {
      const result = await getGasItemsByUat({
        uatId: "95060",
        productId,
      });

      const products = result.Products ?? [];
      const stations = result.Stations ?? [];

      const categories = [
        ...new Set(
          products.map(
            (product) => product.catprod?.name,
          ),
        ),
      ];

      console.log(
        `ID ${productId} (${fuelType}):`,
      );

      console.log(
        `  Stații: ${stations.length}`,
      );

      console.log(
        `  Produse: ${products.length}`,
      );

      console.log(
        `  Categorii: ${categories.join(", ") || "N/A"}`,
      );
    } catch (error) {
      console.log(
        `ID ${productId} (${fuelType}): EROARE`,
        error instanceof Error
          ? error.message
          : error,
      );
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});