import { describe, expect, it } from "vitest";
import { calculatePrivateReserve } from "../src/services/private-reserve-calculation.service.js";
import { generateProofReceipt } from "../src/services/receipt.service.js";
import { privatePayload } from "./helpers.js";

function expectNoPrivateLeak(output: unknown) {
  const serialized = JSON.stringify(output);

  expect(serialized).not.toContain("walletAddress");
  expect(output).not.toHaveProperty("balance");
  expect(serialized).not.toContain("totalReserve");
  expect(serialized).not.toContain("bc1q-private-demo-wallet-address");
}

describe("privacy boundaries", () => {
  it("does not expose wallet addresses or balances in calculation output", () => {
    const result = calculatePrivateReserve({
      proofRequestId: "proof-request-id",
      onChainRequestId: "1",
      projectSlug: "atlasx-exchange",
      privatePayload: privatePayload(),
      workerSignedAt: 1785947000,
    });

    expect(result).not.toHaveProperty("walletAddress");
    expect(result).not.toHaveProperty("balance");
    expect(result).not.toHaveProperty("totalReserve");
    expectNoPrivateLeak(result);
  });

  it("does not expose wallet addresses or balances in receipt output", () => {
    const receipt = generateProofReceipt({
      projectName: "AtlasX Exchange",
      projectSlug: "atlasx-exchange",
      proofRequestId: "proof-request-id",
      onChainRequestId: "1",
      outcome: "PASS",
      thresholdMet: true,
      workerSignedAt: 1785947000,
      proofHash: `0x${"11".repeat(32)}`,
      resultMetadataHash: `0x${"22".repeat(32)}`,
      thresholdCommitment: "0xthreshold",
      selectedAssetsHash: "0xselectedassets",
      encryptedPayloadHash: "0xencryptedpayload",
      signerAddress: "0xworker",
      signature: "0xsignature",
    });

    expectNoPrivateLeak(receipt);
  });
});
