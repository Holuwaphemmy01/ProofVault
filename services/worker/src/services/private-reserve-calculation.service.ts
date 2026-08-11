import {
  canonicalJson,
  sha256Hex,
  type PrivateProofPayload,
} from "@proofvault/proof-payload";
import { isSupportedAsset } from "@proofvault/config";
import { getBalanceAdapter } from "../adapters/balance/adapter-factory.js";
import { getPriceAdapter } from "../adapters/price/price-adapter.factory.js";
import type { PriceAdapter } from "../adapters/price/price-adapter.interface.js";
import type { ProofOutcome } from "../types/worker.types.js";
import { verifyReserveThreshold } from "../integrations/fcc/fcc-threshold.service.js";
import type { FccClient } from "../integrations/fcc/fcc-client.js";

type CalculatePrivateReserveInput = {
  proofRequestId: string;
  onChainRequestId: string;
  projectSlug: string;
  privatePayload: PrivateProofPayload;
  workerSignedAt: number;
  priceAdapter?: PriceAdapter;
  verifiedWith?: string[];
  fccClient?: FccClient;
  fccMode?: "live" | "local";
  fccFallbackEnabled?: boolean;
};

export async function calculatePrivateReserve(input: CalculatePrivateReserveInput) {
  const { privatePayload } = input;

  if (privatePayload.wallets.length === 0) {
    throw new Error("Private proof payload must include at least one wallet");
  }

  if (privatePayload.requiredThreshold <= 0) {
    throw new Error("Private proof payload threshold must be greater than zero");
  }

  for (const asset of privatePayload.selectedAssets) {
    if (!isSupportedAsset(asset)) {
      throw new Error(`Unsupported asset: ${asset}`);
    }
  }

  for (const wallet of privatePayload.wallets) {
    if (!isSupportedAsset(wallet.assetSymbol)) {
      throw new Error(`Unsupported asset: ${wallet.assetSymbol}`);
    }
  }

  const priceAdapter = input.priceAdapter ?? getPriceAdapter();
  const priceSources = new Set<string>();
  const reserveValues = await Promise.all(privatePayload.wallets.map(async (wallet) => {
    const adapter = getBalanceAdapter(wallet.chain);
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
    priceSources.add(priceResult.source);

    return balanceResult.balance * priceResult.price;
  }));
  const thresholdResult = await verifyReserveThreshold({
    requestId: input.proofRequestId,
    requiredThreshold: privatePayload.requiredThreshold,
    assetValues: reserveValues,
    client: input.fccClient,
    mode: input.fccMode,
    fallbackEnabled: input.fccFallbackEnabled,
    commitment: sha256Hex(canonicalJson({
      proofRequestId: input.proofRequestId,
      onChainRequestId: input.onChainRequestId,
      projectSlug: input.projectSlug,
      selectedAssets: privatePayload.selectedAssets,
      workerSignedAt: input.workerSignedAt,
    })),
  });
  const thresholdMet = thresholdResult.thresholdMet;
  const outcome: ProofOutcome = thresholdResult.outcome;
  const verifiedWith = [
    ...(input.verifiedWith ?? []),
    ...(priceSources.has("ftso") ? ["FTSO"] : []),
    ...(thresholdResult.computeSource === "fcc" ? ["FCC"] : ["LOCAL_FALLBACK_COMPUTE"]),
  ];
  const proofHash = thresholdResult.outputCommitment;
  const resultMetadataHash = sha256Hex(canonicalJson({
    status: outcome,
    thresholdMet,
    verifiedWith,
    computeSource: thresholdResult.computeSource,
    executionReference: thresholdResult.executionReference,
    privacyMode: "confidential_threshold_proof",
  }));

  return {
    outcome,
    thresholdMet,
    proofHash,
    resultMetadataHash,
    verifiedWith,
    computeSource: thresholdResult.computeSource,
    executionReference: thresholdResult.executionReference,
  };
}
