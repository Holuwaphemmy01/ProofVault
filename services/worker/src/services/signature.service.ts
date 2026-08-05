import { ethers } from "ethers";
import { env } from "../lib/env.js";
import type { ProofOutcome } from "../types/worker.types.js";

const outcomeNumbers: Record<ProofOutcome, number> = {
  PASS: 0,
  FAIL: 1,
};

type SignProofResultInput = {
  onChainRequestId: string;
  proofHash: string;
  outcome: ProofOutcome;
  resultMetadataHash: string;
  workerSignedAt: number;
};

export async function signProofResult(input: SignProofResultInput) {
  if (!env.WORKER_PRIVATE_KEY) {
    throw new Error("WORKER_PRIVATE_KEY is not configured");
  }

  if (!env.PROOFVAULT_REGISTRY_ADDRESS) {
    throw new Error("PROOFVAULT_REGISTRY_ADDRESS is not configured");
  }

  const workerWallet = new ethers.Wallet(env.WORKER_PRIVATE_KEY);
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ["address", "uint256", "uint256", "bytes32", "uint8", "uint256", "bytes32"],
    [
      env.PROOFVAULT_REGISTRY_ADDRESS,
      env.CHAIN_ID,
      input.onChainRequestId,
      input.proofHash,
      outcomeNumbers[input.outcome],
      input.workerSignedAt,
      input.resultMetadataHash,
    ],
  );
  const messageHash = ethers.keccak256(encoded);
  const signature = await workerWallet.signMessage(ethers.getBytes(messageHash));

  return {
    messageHash,
    signature,
    signerAddress: workerWallet.address,
    workerSignedAt: input.workerSignedAt,
  };
}
