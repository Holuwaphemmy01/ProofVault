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
  it("returns PASS when BTC and XRP meet the threshold", async () => {
    const result = await calculatePrivateReserve({
      ...baseInput,
      privatePayload: privatePayload({
        requiredThreshold: 900000,
        selectedAssets: ["BTC", "XRP"],
        wallets: [
          {
            assetSymbol: "BTC",
            chain: "bitcoin",
            walletAddress: "bc1q-private-demo-wallet-address",
          },
          {
            assetSymbol: "XRP",
            chain: "xrp",
            walletAddress: "r-private-demo-wallet-address",
          },
        ],
      }),
    });

    expect(result.thresholdMet).toBe(true);
    expect(result.outcome).toBe("PASS");
  });

  it("returns FAIL when DOGE alone is below the threshold", async () => {
    const result = await calculatePrivateReserve({
      ...baseInput,
      privatePayload: privatePayload({
        requiredThreshold: 500000,
        selectedAssets: ["DOGE"],
        wallets: [
          {
            assetSymbol: "DOGE",
            chain: "dogecoin",
            walletAddress: "D-private-demo-wallet-address",
          },
        ],
      }),
    });

    expect(result.thresholdMet).toBe(false);
    expect(result.outcome).toBe("FAIL");
  });

  it("rejects empty wallets", () => {
    expect(calculatePrivateReserve({
      ...baseInput,
      privatePayload: privatePayload({ wallets: [] }),
    })).rejects.toThrow("at least one wallet");
  });

  it("rejects zero threshold", () => {
    expect(calculatePrivateReserve({
      ...baseInput,
      privatePayload: privatePayload({ requiredThreshold: 0 }),
    })).rejects.toThrow("threshold must be greater than zero");
  });
});
