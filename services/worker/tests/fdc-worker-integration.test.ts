import { beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "../src/lib/env.js";
import { processProofJob } from "../src/services/proof-worker.service.js";
import { makeEncryptedPayload, privatePayload } from "./helpers.js";

const xrplAddress = "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh";

vi.mock("../src/integrations/fdc/address-validity.service.js", () => ({
  requiresFdcAddressValidity: (chain: string) => chain.toLowerCase() === "xrpl",
  validateExternalAddress: vi.fn(async () => ({
    attestationType: "AddressValidity",
    chain: "XRP",
    valid: true,
    source: "FDC",
    roundId: 1,
    votingRoundId: 1,
    requestTxHash: `0x${"56".repeat(32)}`,
    requestBlockNumber: 10,
    proofAvailable: true,
    proofVerified: true,
    verificationSource: "FDC",
    fdcHubAddress: "injected",
    fdcHubAddressSource: "injected",
    fdcVerificationAddress: "injected",
    fdcVerificationAddressSource: "injected",
    verifiedAt: new Date(0).toISOString(),
    addressHash: `0x${"78".repeat(32)}`,
  })),
}));

describe("worker FDC AddressValidity flow", () => {
  beforeEach(() => {
    env.API_BASE_URL = "";
  });

  it("claims FDC_ADDRESS_VALIDITY only after address validation succeeds", async () => {
    const payload = privatePayload({
      requiredThreshold: 200000,
      selectedAssets: ["FXRP"],
      wallets: [
        {
          assetSymbol: "FXRP",
          chain: "xrpl",
          walletAddress: xrplAddress,
        },
      ],
    });
    const encrypted = makeEncryptedPayload(payload);

    env.WORKER_ENCRYPTION_PRIVATE_KEY = encrypted.privateKey;
    env.WORKER_ENCRYPTION_KEY_ID = encrypted.encryptedProofPayload.keyId;

    const result = await processProofJob({
      proofRequestId: "proof-request-id",
      onChainRequestId: "1",
      projectName: "AtlasX Exchange",
      projectSlug: "atlasx-exchange",
      thresholdCommitment: `0x${"11".repeat(32)}`,
      selectedAssetsHash: `0x${"22".repeat(32)}`,
      encryptedPayloadHash: encrypted.encryptedProofPayload.payloadHash,
      encryptedProofPayload: encrypted.encryptedProofPayload,
      thresholdCurrency: "USD",
    });
    const serialized = JSON.stringify(result);

    expect(result?.status).toBe("completed");
    expect(result?.receipt?.verification).toMatchObject({
      verifiedWith: expect.arrayContaining(["FDC_ADDRESS_VALIDITY"]),
    });
    expect(result?.receipt?.verification.dataSources).toEqual(expect.arrayContaining(["FDC"]));
    expect(serialized).not.toContain(xrplAddress);
    expect(serialized).not.toContain("walletAddress");
    expect(serialized).not.toContain("\"balance\"");
    expect(serialized).not.toContain("\"usdValue\"");
    expect(serialized).not.toContain("totalReserve");
  });
});
