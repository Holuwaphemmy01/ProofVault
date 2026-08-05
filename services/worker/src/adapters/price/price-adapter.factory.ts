import type { PriceAdapter } from "./price-adapter.interface.js";
import { MockPriceAdapter } from "./mock-price.adapter.js";

export function getPriceAdapter(): PriceAdapter {
  return new MockPriceAdapter();
}
