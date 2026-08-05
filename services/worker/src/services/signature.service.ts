import { ethers } from "ethers";
import { env } from "../lib/env.js";
import type { ProofOutcome } from "../types/worker.types.js";

const outcomeNumbers: Record<ProofOutcome, number> = {
  PASS: 0,
  FAIL: 1,
};

type SignProofResultInput = {
  registryAddress?: string;
  chainId?: number;
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

  const registryAddress = input.registryAddress ?? env.PROOFVAULT_REGISTRY_ADDRESS;
  const chainId = input.chainId ?? env.CHAIN_ID;

  if (!registryAddress) {
    throw new Error("PROOFVAULT_REGISTRY_ADDRESS is not configured");
  }

  if (!input.onChainRequestId) {
    throw new Error("onChainRequestId is required");
  }

  if (!input.proofHash) {
    throw new Error("proofHash is required");
  }

  if (!input.resultMetadataHash) {
    throw new Error("resultMetadataHash is required");
  }

  const workerWallet = new ethers.Wallet(env.WORKER_PRIVATE_KEY);
  const outcomeNumber = outcomeNumbers[input.outcome];
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ["address", "uint256", "uint256", "bytes32", "uint8", "uint256", "bytes32"],
    [
      registryAddress,
      chainId,
      input.onChainRequestId,
      input.proofHash,
      outcomeNumber,
      input.workerSignedAt,
      input.resultMetadataHash,
    ],
  );
  const messageHash = ethers.keccak256(encoded);
  const signature = await workerWallet.signMessage(ethers.getBytes(messageHash));
  const recoveredAddress = ethers.verifyMessage(ethers.getBytes(messageHash), signature);

  if (recoveredAddress.toLowerCase() !== workerWallet.address.toLowerCase()) {
    throw new Error("Worker signature self-verification failed");
  }

  return {
    messageHash,
    signature,
    signerAddress: workerWallet.address,
    workerSignedAt: input.workerSignedAt,
  };
}
