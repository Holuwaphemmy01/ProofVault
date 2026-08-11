import { describe, expect, it, vi } from "vitest";
import { FccClient } from "../src/integrations/fcc/fcc-client.js";
import { verifyReserveThreshold } from "../src/integrations/fcc/fcc-threshold.service.js";
import { calculatePrivateReserve } from "../src/services/private-reserve-calculation.service.js";
import { generateProofReceipt } from "../src/services/receipt.service.js";
import { privatePayload } from "./helpers.js";

const outputCommitment = `0x${"ab".repeat(32)}`;

function liveClient(outcome: "PASS" | "FAIL" = "PASS") {
  return new FccClient({
    endpoint: "https://fcc.example",
    fetchFn: vi.fn(async () => Response.json({
      result: {
        thresholdMet: outcome === "PASS",
        outcome,
        outputCommitment,
        timestamp: 1785947000,
        executionReference: "fcc-exec-1",
      },
    })) as unknown as typeof fetch,
    timeoutMs: 100,
  });
}

describe("FCC threshold integration", () => {
  it("accepts safe live FCC output", async () => {
    const result = await verifyReserveThreshold({
      requestId: "proof-request-id",
      requiredThreshold: 200000,
      assetValues: [120000, 100000],
      commitment: `0x${"11".repeat(32)}`,
      client: liveClient(),
      mode: "live",
      fallbackEnabled: false,
    });

    expect(result).toMatchObject({
      thresholdMet: true,
      outcome: "PASS",
      outputCommitment,
      computeSource: "fcc",
      executionReference: "fcc-exec-1",
    });
  });

  it("returns PASS from live FCC for sufficient values", async () => {
    const result = await calculatePrivateReserve({
      proofRequestId: "proof-request-id",
      onChainRequestId: "1",
      projectSlug: "atlasx-exchange",
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
      workerSignedAt: 1785947000,
      fccClient: liveClient("PASS"),
      fccMode: "live",
      fccFallbackEnabled: false,
    });

    expect(result.outcome).toBe("PASS");
    expect(result.thresholdMet).toBe(true);
    expect(result.verifiedWith).toContain("FCC");
    expect(result.verifiedWith).not.toContain("LOCAL_FALLBACK_COMPUTE");
  });

  it("returns FAIL from live FCC when threshold is not met", async () => {
    const result = await calculatePrivateReserve({
      proofRequestId: "proof-request-id",
      onChainRequestId: "1",
      projectSlug: "atlasx-exchange",
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
      workerSignedAt: 1785947000,
      fccClient: liveClient("FAIL"),
      fccMode: "live",
      fccFallbackEnabled: false,
    });

    expect(result.outcome).toBe("FAIL");
    expect(result.thresholdMet).toBe(false);
    expect(result.verifiedWith).toContain("FCC");
  });

  it("rejects FCC output that leaks aggregate or reserve values", async () => {
    const client = new FccClient({
      endpoint: "https://fcc.example",
      fetchFn: vi.fn(async () => Response.json({
        result: {
          thresholdMet: true,
          outcome: "PASS",
          outputCommitment,
          totalReserveUSD: 220000,
        },
      })) as unknown as typeof fetch,
      timeoutMs: 100,
    });

    await expect(client.verifyReserveThreshold({
      requestId: "proof-request-id",
      requiredThreshold: 200000,
      assetValues: [120000, 100000],
      commitment: `0x${"11".repeat(32)}`,
    })).rejects.toThrow("private reserve data");
  });

  it("does not silently fall back when live FCC fails", async () => {
    await expect(verifyReserveThreshold({
      requestId: "proof-request-id",
      requiredThreshold: 200000,
      assetValues: [120000, 100000],
      commitment: `0x${"11".repeat(32)}`,
      client: new FccClient({
        endpoint: "https://fcc.example",
        fetchFn: vi.fn(async () => Response.error()) as unknown as typeof fetch,
        timeoutMs: 100,
      }),
      mode: "live",
      fallbackEnabled: false,
    })).rejects.toThrow();
  });

  it("uses labelled local fallback only when explicitly enabled", async () => {
    const result = await verifyReserveThreshold({
      requestId: "proof-request-id",
      requiredThreshold: 200000,
      assetValues: [120000, 100000],
      commitment: `0x${"11".repeat(32)}`,
      client: new FccClient({
        endpoint: "https://fcc.example",
        fetchFn: vi.fn(async () => Response.error()) as unknown as typeof fetch,
        timeoutMs: 100,
      }),
      mode: "live",
      fallbackEnabled: true,
    });

    expect(result.outcome).toBe("PASS");
    expect(result.computeSource).toBe("local-fallback");
  });

  it("receipt claims FCC only for live successful execution", () => {
    const liveReceipt = generateProofReceipt({
      projectName: "AtlasX Exchange",
      projectSlug: "atlasx-exchange",
      proofRequestId: "proof-request-id",
      onChainRequestId: "1",
      outcome: "PASS",
      thresholdMet: true,
      workerSignedAt: 1785947000,
      proofHash: outputCommitment,
      resultMetadataHash: `0x${"cd".repeat(32)}`,
      selectedAssetsHash: `0x${"ef".repeat(32)}`,
      signerAddress: "0xworker",
      signature: "0xsignature",
      verifiedWith: ["FCC"],
    });
    const fallbackReceipt = generateProofReceipt({
      projectName: "AtlasX Exchange",
      projectSlug: "atlasx-exchange",
      proofRequestId: "proof-request-id",
      onChainRequestId: "1",
      outcome: "PASS",
      thresholdMet: true,
      workerSignedAt: 1785947000,
      proofHash: outputCommitment,
      resultMetadataHash: `0x${"cd".repeat(32)}`,
      selectedAssetsHash: `0x${"ef".repeat(32)}`,
      signerAddress: "0xworker",
      signature: "0xsignature",
      verifiedWith: ["LOCAL_FALLBACK_COMPUTE"],
    });

    expect(liveReceipt.verification.verifiedWith).toContain("FCC");
    expect(fallbackReceipt.verification.verifiedWith).not.toContain("FCC");
    expect(fallbackReceipt.verification.verifiedWith).toContain("LOCAL_FALLBACK_COMPUTE");
  });
});
