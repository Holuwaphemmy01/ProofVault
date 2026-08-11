import dotenv from "dotenv";
import { FtsoPriceAdapter } from "../src/adapters/price/ftso-price.adapter.js";

dotenv.config();

const symbol = process.argv[2] ?? "FLR";

async function main() {
  const adapter = new FtsoPriceAdapter();
  const result = await adapter.getPrice({ assetSymbol: symbol });

  console.log({
    symbol: result.assetSymbol,
    price: result.price,
    timestamp: result.timestamp,
    source: result.source,
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "FTSO diagnostic failed");
  process.exit(1);
});
