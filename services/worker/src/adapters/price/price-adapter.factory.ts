import type { PriceAdapter } from "./price-adapter.interface.js";
import { env } from "../../lib/env.js";
import { FtsoPriceAdapter } from "./ftso-price.adapter.js";
import { MockPriceAdapter } from "./mock-price.adapter.js";

export function getPriceAdapter(): PriceAdapter {
  return {
    async getPrice(request) {
      try {
        return await new FtsoPriceAdapter().getPrice(request);
      } catch (error) {
        if (!env.FTSO_FALLBACK_ENABLED) {
          throw error;
        }

        return new MockPriceAdapter("mock-fallback").getPrice(request);
      }
    },
  };
}
