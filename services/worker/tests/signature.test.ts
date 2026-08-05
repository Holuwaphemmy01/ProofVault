import { ethers } from "ethers";
import { describe, expect, it } from "vitest";
import { signProofResult } from "../src/services/signature.service.js";
import { workerAddress } from "./helpers.js";

describe("proof result signature", () => {
  it("generates a signature recoverable to the worker address", async () => {
    const result = await signProofResult({
      registryAddress: "0x0000000000000000000000000000000000000001",
      chainId: 31337,
      onChainRequestId: "1",
      proofHash: `0x${"11".repeat(32)}`,
      outcome: "PASS",
      workerSignedAt: 1785947000,
      resultMetadataHash: `0x${"22".repeat(32)}`,
    });

    const recovered = ethers.verifyMessage(ethers.getBytes(result.messageHash), result.signature);

    expect(result.signerAddress).toBe(workerAddress);
    expect(recovered).toBe(workerAddress);
  });

  it("does not verify after proofHash is changed", async () => {
    const result = await signProofResult({
      registryAddress: "0x0000000000000000000000000000000000000001",
      chainId: 31337,
      onChainRequestId: "1",
      proofHash: `0x${"11".repeat(32)}`,
      outcome: "PASS",
      workerSignedAt: 1785947000,
      resultMetadataHash: `0x${"22".repeat(32)}`,
    });
    const tamperedEncoded = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "uint256", "uint256", "bytes32", "uint8", "uint256", "bytes32"],
      [
        "0x0000000000000000000000000000000000000001",
        31337,
        "1",
        `0x${"12".repeat(32)}`,
        0,
        1785947000,
        `0x${"22".repeat(32)}`,
      ],
    );
    const tamperedHash = ethers.keccak256(tamperedEncoded);
    const recovered = ethers.verifyMessage(ethers.getBytes(tamperedHash), result.signature);

    expect(recovered).not.toBe(workerAddress);
  });

  it("rejects missing on-chain request ID", async () => {
    await expect(signProofResult({
      registryAddress: "0x0000000000000000000000000000000000000001",
      chainId: 31337,
      onChainRequestId: "",
      proofHash: `0x${"11".repeat(32)}`,
      outcome: "PASS",
      workerSignedAt: 1785947000,
      resultMetadataHash: `0x${"22".repeat(32)}`,
    })).rejects.toThrow("onChainRequestId is required");
  });
});
