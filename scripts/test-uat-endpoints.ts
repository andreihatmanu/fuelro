process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const BASE_URL =
  "https://monitorulpreturilor.info/pmonsvc/Gas";

const endpoints = [
  "/GetUats",
  "/GetUat",
  "/GetAllUats",
  "/GetGasUats",
  "/GetGasUat",
];

async function main() {
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(
        `${BASE_URL}${endpoint}`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      const text = await response.text();

      console.log(`\n=== ${endpoint} ===`);
      console.log(`HTTP: ${response.status}`);
      console.log(text.slice(0, 1000));
    } catch (error) {
      console.log(
        `\n=== ${endpoint} ===`,
      );

      console.log(
        error instanceof Error
          ? error.message
          : error,
      );
    }
  }
}

main().catch(console.error);