import { beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "../src/lib/env.js";
import { processProofJob } from "../src/services/proof-worker.service.js";
import { makeEncryptedPayload, privatePayload } from "./helpers.js";

const transactionId = `0x${"ab".repeat(32)}`;

const mocks = vi.hoisted(() => ({
  verifyPaymentAttestation: vi.fn(async () => ({
    attestationType: "Payment",
    chain: "XRP",
    verified: true,
    transactionIdHash: `0x${"12".repeat(32)}`,
    requestTxHash: `0x${"34".repeat(32)}`,
    roundId: 1,
    verificationSource: "FDC",
  })),
}));

vi.mock("../src/integrations/fdc/payment-attestation.service.js", () => ({
  hasPaymentEvidence: (value: unknown) => Boolean(value),
  verifyPaymentAttestation: mocks.verifyPaymentAttestation,
}));

describe("worker FDC Payment flow", () => {
  beforeEach(() => {
    env.API_BASE_URL = "";
    mocks.verifyPaymentAttestation.mockClear();
  });

  it("adds FDC_PAYMENT only after verified payment evidence succeeds", async () => {
    const payload = privatePayload({
      requiredThreshold: 200000,
      selectedAssets: ["FXRP"],
      wallets: [
        {
          assetSymbol: "FXRP",
          chain: "flare",
          walletAddress: "r-private-demo-wallet-address",
          paymentEvidence: {
            chain: "XRP",
            transactionId,
            expectedDestination: `0x${"56".repeat(32)}`,
          },
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
    expect(mocks.verifyPaymentAttestation).toHaveBeenCalledOnce();
    expect(result?.receipt?.verification).toMatchObject({
      verifiedWith: expect.arrayContaining(["FDC_PAYMENT"]),
    });
    expect(serialized).not.toContain(transactionId);
    expect(serialized).not.toContain("paymentEvidence");
    expect(serialized).not.toContain("receivedAmount");
    expect(serialized).not.toContain("spentAmount");
  });

  it("does not claim FDC_PAYMENT when payment verification fails", async () => {
    mocks.verifyPaymentAttestation.mockRejectedValueOnce(new Error("FDC Payment proof verification failed"));

    const payload = privatePayload({
      wallets: [
        {
          assetSymbol: "FXRP",
          chain: "flare",
          walletAddress: "r-private-demo-wallet-address",
          paymentEvidence: {
            chain: "XRP",
            transactionId,
          },
        },
      ],
    });
    const encrypted = makeEncryptedPayload(payload);

    env.WORKER_ENCRYPTION_PRIVATE_KEY = encrypted.privateKey;
    env.WORKER_ENCRYPTION_KEY_ID = encrypted.encryptedProofPayload.keyId;

    const result = await processProofJob({
      proofRequestId: "proof-request-id",
      onChainRequestId: "1",
      projectSlug: "atlasx-exchange",
      encryptedProofPayload: encrypted.encryptedProofPayload,
      thresholdCurrency: "USD",
    });
    const serialized = JSON.stringify(result);

    expect(result?.status).toBe("failed");
    expect(serialized).not.toContain("FDC_PAYMENT");
    expect(serialized).not.toContain(transactionId);
  });
});
