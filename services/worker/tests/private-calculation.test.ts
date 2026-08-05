import { describe, expect, it } from "vitest";
import { calculatePrivateReserve } from "../src/services/private-reserve-calculation.service.js";
import { privatePayload } from "./helpers.js";

const baseInput = {
  proofRequestId: "proof-request-id",
  onChainRequestId: "1",
  projectSlug: "atlasx-exchange",
  workerSignedAt: 1785947000,
};

describe("private reserve calculation", () => {
  it("returns PASS when BTC and FLR meet the threshold", () => {
    const result = calculatePrivateReserve({
      ...baseInput,
      privatePayload: privatePayload(),
    });

    expect(result.thresholdMet).toBe(true);
    expect(result.outcome).toBe("PASS");
  });

  it("returns FAIL when BTC alone is below the threshold", () => {
    const result = calculatePrivateReserve({
      ...baseInput,
      privatePayload: privatePayload({
        selectedAssets: ["BTC"],
        wallets: [
          {
            assetSymbol: "BTC",
            chain: "bitcoin",
            walletAddress: "bc1q-private-demo-wallet-address",
          },
        ],
      }),
    });

    expect(result.thresholdMet).toBe(false);
    expect(result.outcome).toBe("FAIL");
  });

  it("rejects empty wallets", () => {
    expect(() => calculatePrivateReserve({
      ...baseInput,
      privatePayload: privatePayload({ wallets: [] }),
    })).toThrow("at least one wallet");
  });

  it("rejects zero threshold", () => {
    expect(() => calculatePrivateReserve({
      ...baseInput,
      privatePayload: privatePayload({ requiredThreshold: 0 }),
    })).toThrow("threshold must be greater than zero");
  });
});
