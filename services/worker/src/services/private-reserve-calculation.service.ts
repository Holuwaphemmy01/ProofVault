import {
  canonicalJson,
  sha256Hex,
  type PrivateProofPayload,
} from "@proofvault/proof-payload";
import { getBalanceAdapter } from "../adapters/balance/adapter-factory.js";
import { getPriceAdapter } from "../adapters/price/price-adapter.factory.js";
import type { ProofOutcome } from "../types/worker.types.js";

type CalculatePrivateReserveInput = {
  proofRequestId: string;
  onChainRequestId: string;
  projectSlug: string;
  privatePayload: PrivateProofPayload;
  workerSignedAt: number;
};

export async function calculatePrivateReserve(input: CalculatePrivateReserveInput) {
  const { privatePayload } = input;

  if (privatePayload.wallets.length === 0) {
    throw new Error("Private proof payload must include at least one wallet");
  }

  if (privatePayload.requiredThreshold <= 0) {
    throw new Error("Private proof payload threshold must be greater than zero");
  }

  const reserveValues = await Promise.all(privatePayload.wallets.map(async (wallet) => {
    const adapter = getBalanceAdapter(wallet.chain);
    const priceAdapter = getPriceAdapter();
    const [balanceResult, priceResult] = await Promise.all([
      adapter.getBalance({
        chain: wallet.chain,
        assetSymbol: wallet.assetSymbol,
        walletAddressHash: sha256Hex(wallet.walletAddress),
      }),
      priceAdapter.getPrice({
        assetSymbol: wallet.assetSymbol,
      }),
    ]);

    return balanceResult.balance * priceResult.price;
  }));
  const totalReserveUSD = reserveValues.reduce((total, value) => total + value, 0);
  const thresholdMet = totalReserveUSD >= privatePayload.requiredThreshold;
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
