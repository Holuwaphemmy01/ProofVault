import { describe, expect, it } from "vitest";
import { FtsoPriceAdapter } from "../src/adapters/price/ftso-price.adapter.js";

const runLiveTests = process.env.RUN_COSTON2_INTEGRATION_TESTS === "true";
const describeLive = runLiveTests ? describe : describe.skip;

describeLive("FTSO Coston2 live integration", () => {
  it("reads live FLR/USD and BTC/USD feeds", async () => {
    const adapter = new FtsoPriceAdapter();
    const [flr, btc] = await Promise.all([
      adapter.getPrice({ assetSymbol: "FLR" }),
      adapter.getPrice({ assetSymbol: "BTC" }),
    ]);

    for (const result of [flr, btc]) {
      expect(result.source).toBe("ftso");
      expect(result.price).toBeGreaterThan(0);
      expect(result.timestamp).toBeGreaterThan(0);
      expect(Number.isInteger(result.decimals)).toBe(true);
      expect(result.contractAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(["contract-registry", "env-override"]).toContain(result.contractAddressSource);
    }
  }, 30_000);
});
