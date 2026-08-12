import { describe, expect, it, vi } from "vitest";
import { FtsoPriceAdapter, decimalValueToNumber } from "../src/adapters/price/ftso-price.adapter.js";
import { getPriceAdapter } from "../src/adapters/price/price-adapter.factory.js";
import { calculatePrivateReserve } from "../src/services/private-reserve-calculation.service.js";
import { privatePayload } from "./helpers.js";

const now = Math.floor(Date.now() / 1000);

describe("FTSO price adapter", () => {
  it("normalizes BTC/USD feed values", async () => {
    const adapter = new FtsoPriceAdapter({
      feedReader: {
        getFeedById: vi.fn().mockResolvedValue([2700000n, 2, now]),
      },
    });

    const result = await adapter.getPrice({ assetSymbol: "BTC" });

    expect(result.assetSymbol).toBe("BTC");
    expect(result.price).toBe(27000);
    expect(result.currency).toBe("USD");
    expect(result.source).toBe("ftso");
    expect(result.feedId).toBe("0x014254432f55534400000000000000000000000000");
    expect(result.decimals).toBe(2);
    expect(result.timestamp).toBe(now);
  });

  it("maps FXRP to the XRP/USD FTSO feed", async () => {
    const adapter = new FtsoPriceAdapter({
      feedReader: {
        getFeedById: vi.fn().mockResolvedValue([600000n, 6, now]),
      },
    });

    const result = await adapter.getPrice({ assetSymbol: "FXRP" });

    expect(result.assetSymbol).toBe("FXRP");
    expect(result.price).toBe(0.6);
    expect(result.source).toBe("ftso");
    expect(result.feedId).toBe("0x015852502f55534400000000000000000000000000");
  });

  it("normalizes FLR/USD feed values", async () => {
    const adapter = new FtsoPriceAdapter({
      feedReader: {
        getFeedById: vi.fn().mockResolvedValue([2500000n, 8, now]),
      },
    });

    const result = await adapter.getPrice({ assetSymbol: "FLR" });

    expect(result.price).toBe(0.025);
    expect(result.source).toBe("ftso");
    expect(result.feedId).toBe("0x01464c522f55534400000000000000000000000000");
  });

  it("normalizes DOGE/USD feed values", async () => {
    const adapter = new FtsoPriceAdapter({
      feedReader: {
        getFeedById: vi.fn().mockResolvedValue([8000000n, 8, now]),
      },
    });

    const result = await adapter.getPrice({ assetSymbol: "DOGE" });

    expect(result.price).toBe(0.08);
    expect(result.source).toBe("ftso");
    expect(result.feedId).toBe("0x01444f47452f555344000000000000000000000000");
  });

  it("converts decimal representations", () => {
    expect(decimalValueToNumber(123456n, 4)).toBe(12.3456);
    expect(decimalValueToNumber(123n, -2)).toBe(12300);
    expect(decimalValueToNumber(42n, 0)).toBe(42);
  });

  it("rejects unsupported feeds", async () => {
    const adapter = new FtsoPriceAdapter({
      feedReader: {
        getFeedById: vi.fn(),
      },
    });

    await expect(adapter.getPrice({ assetSymbol: "USDT0" })).rejects.toThrow("Unsupported FTSO price feed");
  });

  it("rejects malformed feed results", async () => {
    const adapter = new FtsoPriceAdapter({
      feedReader: {
        getFeedById: vi.fn().mockResolvedValue([0n, -8, now]),
      },
    });

    await expect(adapter.getPrice({ assetSymbol: "FLR" })).rejects.toThrow("Malformed FTSO price result");
  });

  it("does not silently fall back when a live adapter call fails", async () => {
    const adapter = new FtsoPriceAdapter({
      feedReader: {
        getFeedById: vi.fn().mockRejectedValue(new Error("rpc unavailable")),
      },
    });

    await expect(adapter.getPrice({ assetSymbol: "FLR" })).rejects.toThrow("rpc unavailable");
  });

  it("configured factory fallback reports mock-fallback", async () => {
    const adapter = getPriceAdapter();
    const result = await adapter.getPrice({ assetSymbol: "FXRP" });

    expect(result.source).toBe("mock-fallback");
    expect(result.dataSource).toBe("MOCK_PRICE_FALLBACK");
    expect(result.price).toBe(0.6);
  });

  it("private calculation consumes FTSO prices and claims FTSO only when used", async () => {
    const result = await calculatePrivateReserve({
      proofRequestId: "proof-request-id",
      onChainRequestId: "1",
      projectSlug: "atlasx-exchange",
      workerSignedAt: now,
      priceAdapter: {
        async getPrice(request) {
          return {
            assetSymbol: request.assetSymbol,
            price: request.assetSymbol === "BTC" ? 27000 : 0.025,
            currency: "USD",
            source: "ftso",
            timestamp: now,
            decimals: -8,
            feedId: "0xfeed",
          };
        },
      },
      privatePayload: privatePayload({
        requiredThreshold: 3000,
        selectedAssets: ["BTC", "FLR"],
        wallets: [
          {
            assetSymbol: "BTC",
            chain: "flare",
            walletAddress: "bc1q-private-demo-wallet-address",
          },
          {
            assetSymbol: "FLR",
            chain: "flare",
            walletAddress: "0x92A7-private-demo-wallet-address",
          },
        ],
      }),
    });

    expect(result.thresholdMet).toBe(true);
    expect(result.verifiedWith).toContain("FTSO");
    expect(result.dataSources).toContain("FTSO");
    expect(JSON.stringify(result)).not.toContain("27000");
    expect(JSON.stringify(result)).not.toContain("0.025");
  });

  it("does not claim FTSO when fallback pricing is used", async () => {
    const result = await calculatePrivateReserve({
      proofRequestId: "proof-request-id",
      onChainRequestId: "1",
      projectSlug: "atlasx-exchange",
      workerSignedAt: now,
      priceAdapter: {
        async getPrice(request) {
          return {
            assetSymbol: request.assetSymbol,
            price: 0.6,
            currency: "USD",
            source: "mock-fallback",
            dataSource: "MOCK_PRICE_FALLBACK",
          };
        },
      },
      privatePayload: privatePayload({
        requiredThreshold: 200000,
        selectedAssets: ["FXRP"],
        wallets: [
          {
            assetSymbol: "FXRP",
            chain: "flare",
            walletAddress: "r-private-demo-wallet-address",
          },
        ],
      }),
    });

    expect(result.verifiedWith).not.toContain("FTSO");
    expect(result.dataSources).toContain("MOCK_PRICE_FALLBACK");
  });
});
