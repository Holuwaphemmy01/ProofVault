import { describe, expect, it } from "vitest";
import { calculatePrivateReserve } from "../src/services/private-reserve-calculation.service.js";
import { generateProofReceipt } from "../src/services/receipt.service.js";
import { signProofResult } from "../src/services/signature.service.js";
import { privatePayload, workerAddress } from "./helpers.js";

describe("worker flow", () => {
  it("calculates, signs, and receipts a proof result", async () => {
    const workerSignedAt = Math.floor(Date.now() / 1000);
    const reserveResult = calculatePrivateReserve({
      proofRequestId: "proof-request-id",
      onChainRequestId: "1",
      projectSlug: "atlasx-exchange",
      privatePayload: privatePayload(),
      workerSignedAt,
    });
    const signature = await signProofResult({
      registryAddress: "0x0000000000000000000000000000000000000001",
      chainId: 31337,
      onChainRequestId: "1",
      proofHash: reserveResult.proofHash,
      outcome: reserveResult.outcome,
      workerSignedAt,
      resultMetadataHash: reserveResult.resultMetadataHash,
    });
    const receipt = generateProofReceipt({
      projectName: "AtlasX Exchange",
      projectSlug: "atlasx-exchange",
      proofRequestId: "proof-request-id",
      onChainRequestId: "1",
      outcome: reserveResult.outcome,
      thresholdMet: reserveResult.thresholdMet,
      workerSignedAt,
      proofHash: reserveResult.proofHash,
      resultMetadataHash: reserveResult.resultMetadataHash,
      thresholdCommitment: "0xthreshold",
      selectedAssetsHash: "0xselectedassets",
      encryptedPayloadHash: "0xencryptedpayload",
      signerAddress: signature.signerAddress,
      signature: signature.signature,
    });

    expect(reserveResult.outcome).toBe("PASS");
    expect(reserveResult.proofHash).toMatch(/^0x/);
    expect(signature.signature).toMatch(/^0x/);
    expect(signature.signerAddress).toBe(workerAddress);
    expect(receipt.version).toBe("proofvault-receipt-v1");
  });
});
