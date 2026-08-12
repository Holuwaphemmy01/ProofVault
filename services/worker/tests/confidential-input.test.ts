import { describe, expect, it } from "vitest";
import { env } from "../src/lib/env.js";
import { FccInputService } from "../src/confidential-input/fcc-input.service.js";
import { LocalDevInputService } from "../src/confidential-input/local-dev-input.service.js";
import type { FccClient } from "../src/integrations/fcc/fcc-client.js";
import { makeEncryptedPayload, privatePayload } from "./helpers.js";

describe("confidential input modes", () => {
  it("keeps local-dev RSA decryption available for tests", async () => {
    const payload = privatePayload();
    const encrypted = makeEncryptedPayload(payload);

    env.WORKER_ENCRYPTION_PRIVATE_KEY = encrypted.privateKey;
    env.WORKER_ENCRYPTION_KEY_ID = encrypted.encryptedProofPayload.keyId;

    const resolved = await new LocalDevInputService().resolve({
      proofRequestId: "proof-request-id",
      onChainRequestId: "1",
      projectSlug: payload.projectSlug,
      encryptedProofPayload: encrypted.encryptedProofPayload,
      thresholdCurrency: "USD",
    }, {
      workerSignedAt: 1785947000,
      verifiedWith: [],
    });

    expect(resolved.mode).toBe("local-dev");
    expect(resolved.privatePayload.projectSlug).toBe(payload.projectSlug);
    expect(resolved.privatePayload.wallets[0]?.walletAddress).toBe(payload.wallets[0]?.walletAddress);
  });

  it("FCC mode resolves without requiring WORKER_ENCRYPTION_PRIVATE_KEY", async () => {
    const payload = privatePayload();
    const encrypted = makeEncryptedPayload(payload);
    const previousKey = env.WORKER_ENCRYPTION_PRIVATE_KEY;

    env.WORKER_ENCRYPTION_PRIVATE_KEY = "";

    const service = new FccInputService({
      executeConfidentialProof: async () => ({
        thresholdMet: true,
        outcome: "PASS",
        outputCommitment: `0x${"ab".repeat(32)}`,
        timestamp: 1785947000,
        executionReference: "fcc-execution-1",
      }),
    } as unknown as FccClient);

    const resolved = await service.resolve({
      proofRequestId: "proof-request-id",
      onChainRequestId: "1",
      projectSlug: payload.projectSlug,
      thresholdCommitment: `0x${"11".repeat(32)}`,
      selectedAssetsHash: `0x${"22".repeat(32)}`,
      encryptedPayloadHash: encrypted.encryptedProofPayload.payloadHash,
      encryptedProofPayload: encrypted.encryptedProofPayload,
      thresholdCurrency: "USD",
    }, {
      workerSignedAt: 1785947000,
      verifiedWith: [],
    });
    const serialized = JSON.stringify(resolved);

    env.WORKER_ENCRYPTION_PRIVATE_KEY = previousKey;

    expect(resolved.mode).toBe("fcc");
    expect(resolved.reserveResult.verifiedWith).toContain("FCC");
    expect(serialized).not.toContain(payload.wallets[0]?.walletAddress);
    expect(serialized).not.toContain("assetValues");
    expect(serialized).not.toContain("totalReserve");
  });

  it("FCC mode requires an encrypted confidential payload reference", async () => {
    const service = new FccInputService({
      executeConfidentialProof: async () => {
        throw new Error("should not be called");
      },
    } as unknown as FccClient);

    await expect(service.resolve({
      proofRequestId: "proof-request-id",
      onChainRequestId: "1",
      projectSlug: "atlasx-exchange",
      requiredThreshold: 100,
      thresholdCurrency: "USD",
      selectedAssets: ["BTC"],
      walletReferences: [{
        assetSymbol: "BTC",
        chain: "flare",
        encryptedWalletReference: "encrypted",
        walletAddressHash: "hash",
      }],
    }, {
      workerSignedAt: 1785947000,
      verifiedWith: [],
    })).rejects.toThrow("encryptedProofPayload is required");
  });
});
