import type { PrivateProofPayload } from "@proofvault/proof-payload";
import type { ProofOutcome } from "../types/worker.types.js";

const mockUsdValuesByAsset: Record<string, number> = {
  BTC: 750000,
  FLR: 400000,
};

export function runMockConfidentialCompute(input: PrivateProofPayload) {
  const totalMockReserveValue = input.wallets.reduce((total, reference) => {
    return total + (mockUsdValuesByAsset[reference.assetSymbol.toUpperCase()] ?? 0);
  }, 0);
  const thresholdMet = totalMockReserveValue >= input.requiredThreshold;
  const outcome: ProofOutcome = thresholdMet ? "PASS" : "FAIL";

  return {
    thresholdMet,
    outcome,
    verifiedWith: ["MOCK_CONFIDENTIAL_COMPUTE"],
  };
}
