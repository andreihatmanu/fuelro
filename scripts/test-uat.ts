process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { getUatByName } from "../lib/data-sources/anpc";

async function main() {
  const result = await getUatByName("Iasi");

  console.log(
    JSON.stringify(result, null, 2),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});