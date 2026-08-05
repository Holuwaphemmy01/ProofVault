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
  it("returns PASS when FBTC and FXRP meet the threshold", async () => {
    const result = await calculatePrivateReserve({
      ...baseInput,
      privatePayload: privatePayload({
        requiredThreshold: 200000,
        selectedAssets: ["FBTC", "FXRP"],
        wallets: [
          {
            assetSymbol: "FBTC",
            chain: "flare",
            walletAddress: "bc1q-private-demo-wallet-address",
          },
          {
            assetSymbol: "FXRP",
            chain: "flare",
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
        requiredThreshold: 200000,
        selectedAssets: ["FDOGE"],
        wallets: [
          {
            assetSymbol: "FDOGE",
            chain: "flare",
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
