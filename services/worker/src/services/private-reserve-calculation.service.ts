import {
  canonicalJson,
  sha256Hex,
  type PrivateProofPayload,
} from "@proofvault/proof-payload";
import type { ProofOutcome } from "../types/worker.types.js";

type CalculatePrivateReserveInput = {
  proofRequestId: string;
  onChainRequestId: string;
  projectSlug: string;
  privatePayload: PrivateProofPayload;
  workerSignedAt: number;
};

export function simulateAssetBalance(assetSymbol: string): number {
  switch (assetSymbol.toUpperCase()) {
    case "BTC":
      return 750000;
    case "FLR":
      return 400000;
    case "ETH":
      return 300000;
    default:
      return 100000;
  }
}

export function calculatePrivateReserve(input: CalculatePrivateReserveInput) {
  const { privatePayload } = input;

  if (privatePayload.wallets.length === 0) {
    throw new Error("Private proof payload must include at least one wallet");
  }

  if (privatePayload.requiredThreshold <= 0) {
    throw new Error("Private proof payload threshold must be greater than zero");
  }

  const totalReserve = privatePayload.wallets.reduce((total, wallet) => {
    return total + simulateAssetBalance(wallet.assetSymbol);
  }, 0);
  const thresholdMet = totalReserve >= privatePayload.requiredThreshold;
  const outcome: ProofOutcome = thresholdMet ? "PASS" : "FAIL";
  const verifiedWith = ["MOCK_CONFIDENTIAL_COMPUTE"];
  const proofHash = sha256Hex(canonicalJson({
    proofRequestId: input.proofRequestId,
    onChainRequestId: input.onChainRequestId,
    projectSlug: input.projectSlug,
    selectedAssets: privatePayload.selectedAssets,
    thresholdMet,
    outcome,
    workerSignedAt: input.workerSignedAt,
  }));
  const resultMetadataHash = sha256Hex(canonicalJson({
    status: outcome,
    thresholdMet,
    verifiedWith,
    privacyMode: "confidential_threshold_proof",
  }));

  return {
    outcome,
    thresholdMet,
    proofHash,
    resultMetadataHash,
    verifiedWith,
  };
}
