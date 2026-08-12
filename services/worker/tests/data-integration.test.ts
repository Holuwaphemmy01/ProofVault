import { describe, expect, it } from "vitest";
import { calculatePrivateReserve } from "../src/services/private-reserve-calculation.service.js";
import { privatePayload } from "./helpers.js";

const baseInput = {
  proofRequestId: "proof-request-id",
  onChainRequestId: "1",
  projectSlug: "atlasx-exchange",
  workerSignedAt: 1785947000,
};

function expectNoPrivateValuationLeak(result: unknown) {
  expect(result).not.toHaveProperty("balance");
  expect(result).not.toHaveProperty("usdValue");
  expect(result).not.toHaveProperty("totalReserveUSD");

  const serialized = JSON.stringify(result);

  expect(serialized).not.toContain("balance");
  expect(serialized).not.toContain("usdValue");
  expect(serialized).not.toContain("totalReserveUSD");
}

describe("data integration reserve calculation", () => {
  it("returns PASS for multi-asset BTC and FXRP above threshold", async () => {
    const result = await calculatePrivateReserve({
      ...baseInput,
      privatePayload: privatePayload({
        requiredThreshold: 200000,
        selectedAssets: ["BTC", "FXRP"],
        wallets: [
          {
            assetSymbol: "BTC",
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

  it("returns FAIL for DOGE below threshold", async () => {
    const result = await calculatePrivateReserve({
      ...baseInput,
      privatePayload: privatePayload({
        requiredThreshold: 200000,
        selectedAssets: ["DOGE"],
        wallets: [
          {
            assetSymbol: "DOGE",
            chain: "flare",
            walletAddress: "D-private-demo-wallet-address",
          },
        ],
      }),
    });

    expect(result.thresholdMet).toBe(false);
    expect(result.outcome).toBe("FAIL");
  });

  it("returns PASS when reserve value equals the threshold", async () => {
    const result = await calculatePrivateReserve({
      ...baseInput,
      privatePayload: privatePayload({
        requiredThreshold: 160000,
        selectedAssets: ["DOGE"],
        wallets: [
          {
            assetSymbol: "DOGE",
            chain: "flare",
            walletAddress: "D-private-demo-wallet-address",
          },
        ],
      }),
    });

    expect(result.thresholdMet).toBe(true);
    expect(result.outcome).toBe("PASS");
  });

  it("aggregates mixed BTC, FXRP, and DOGE assets", async () => {
    const result = await calculatePrivateReserve({
      ...baseInput,
      privatePayload: privatePayload({
        requiredThreshold: 460000,
        selectedAssets: ["BTC", "FXRP", "DOGE"],
        wallets: [
          {
            assetSymbol: "BTC",
            chain: "flare",
            walletAddress: "bc1q-private-demo-wallet-address",
          },
          {
            assetSymbol: "FXRP",
            chain: "flare",
            walletAddress: "r-private-demo-wallet-address",
          },
          {
            assetSymbol: "DOGE",
            chain: "flare",
            walletAddress: "D-private-demo-wallet-address",
          },
        ],
      }),
    });

    expect(result.thresholdMet).toBe(true);
    expect(result.outcome).toBe("PASS");
  });

  it("rejects unsupported assets", async () => {
    await expect(calculatePrivateReserve({
      ...baseInput,
      privatePayload: privatePayload({
        selectedAssets: ["FAKE"],
        wallets: [
          {
            assetSymbol: "FAKE",
            chain: "unknown",
            walletAddress: "fake-private-wallet",
          },
        ],
      }),
    })).rejects.toThrow("Unsupported asset: FAKE");
  });

  it("does not expose balance, USD value, or total reserve", async () => {
    const result = await calculatePrivateReserve({
      ...baseInput,
      privatePayload: privatePayload({
        requiredThreshold: 200000,
        selectedAssets: ["BTC", "FXRP"],
        wallets: [
          {
            assetSymbol: "BTC",
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

    expectNoPrivateValuationLeak(result);
  });
});
