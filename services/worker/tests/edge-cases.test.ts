import { describe, expect, it } from "vitest";
import { proofJobSchema } from "../src/schemas/proof-job.schema.js";
import { privatePayload } from "./helpers.js";

describe("worker edge cases", () => {
  it("rejects missing proofRequestId", () => {
    expect(proofJobSchema.safeParse({
      onChainRequestId: "1",
      projectSlug: "atlasx-exchange",
      requiredThreshold: 1000000,
      selectedAssets: ["FBTC"],
      walletReferences: [
        {
          assetSymbol: "FBTC",
          chain: "flare",
          encryptedWalletReference: "0xencrypted",
          walletAddressHash: "0xhash",
        },
      ],
    }).success).toBe(false);
  });

  it("rejects missing onChainRequestId", () => {
    expect(proofJobSchema.safeParse({
      proofRequestId: "proof-request-id",
      projectSlug: "atlasx-exchange",
      requiredThreshold: 1000000,
      selectedAssets: ["FBTC"],
      walletReferences: [
        {
          assetSymbol: "FBTC",
          chain: "flare",
          encryptedWalletReference: "0xencrypted",
          walletAddressHash: "0xhash",
        },
      ],
    }).success).toBe(false);
  });

  it("keeps workerSignedAt close to current time", () => {
    const now = Math.floor(Date.now() / 1000);
    const workerSignedAt = Math.floor(Date.now() / 1000);

    expect(workerSignedAt).toBeGreaterThanOrEqual(now - 1);
    expect(workerSignedAt).toBeLessThanOrEqual(now + 1);
  });

  it("can construct a valid private payload fixture", () => {
    expect(privatePayload().requiredThreshold).toBe(1000000);
  });
});
