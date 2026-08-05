import type { ProofJobInput } from "../schemas/proof-job.schema.js";
import type { PrivateProofPayload } from "@proofvault/proof-payload";
import { createJob, updateJob } from "../lib/in-memory-job-store.js";
import { env } from "../lib/env.js";
import { sendWorkerCallback } from "./callback.service.js";
import { decryptProofPayload } from "./payload-decryption.service.js";
import { calculatePrivateReserve } from "./private-reserve-calculation.service.js";
import { generateProofReceipt } from "./receipt.service.js";
import { signProofResult } from "./signature.service.js";

function toPrivatePayload(input: ProofJobInput): PrivateProofPayload {
  if (input.encryptedProofPayload) {
    return decryptProofPayload(input.encryptedProofPayload);
  }

  return {
    projectSlug: input.projectSlug,
    proofName: "Legacy Mock Proof Job",
    requiredThreshold: input.requiredThreshold ?? 0,
    thresholdCurrency: input.thresholdCurrency,
    selectedAssets: input.selectedAssets ?? [],
    wallets: (input.walletReferences ?? []).map((reference) => ({
      assetSymbol: reference.assetSymbol,
      chain: reference.chain,
      walletAddress: reference.walletAddressHash,
      sourceLabel: undefined,
    })),
    privateSalt: "legacy-mock-salt",
    createdAt: new Date().toISOString(),
  };
}

export async function processProofJob(input: ProofJobInput) {
  const job = createJob(input);

  try {
    updateJob(job.id, {
      status: "processing",
    });

    const workerSignedAt = Math.floor(Date.now() / 1000);
    const privatePayload = toPrivatePayload(input);
    const reserveResult = calculatePrivateReserve({
      proofRequestId: input.proofRequestId,
      onChainRequestId: input.onChainRequestId,
      projectSlug: input.projectSlug,
      workerSignedAt,
      privatePayload,
    });
    const signature = await signProofResult({
      registryAddress: env.PROOFVAULT_REGISTRY_ADDRESS,
      chainId: env.CHAIN_ID,
      onChainRequestId: input.onChainRequestId,
      proofHash: reserveResult.proofHash,
      outcome: reserveResult.outcome,
      resultMetadataHash: reserveResult.resultMetadataHash,
      workerSignedAt,
    });
    const receipt = generateProofReceipt({
      projectName: input.projectName ?? privatePayload.projectSlug,
      projectSlug: input.projectSlug,
      proofRequestId: input.proofRequestId,
      onChainRequestId: input.onChainRequestId,
      outcome: reserveResult.outcome,
      thresholdMet: reserveResult.thresholdMet,
      workerSignedAt: signature.workerSignedAt,
      proofHash: reserveResult.proofHash,
      resultMetadataHash: reserveResult.resultMetadataHash,
      thresholdCommitment: input.thresholdCommitment,
      selectedAssetsHash: input.selectedAssetsHash ?? "",
      encryptedPayloadHash: input.encryptedPayloadHash ?? input.encryptedProofPayload?.payloadHash,
      signerAddress: signature.signerAddress,
      signature: signature.signature,
    });
    const callback = await sendWorkerCallback({
      proofRequestId: input.proofRequestId,
      outcome: reserveResult.outcome,
      thresholdMet: reserveResult.thresholdMet,
      proofHash: reserveResult.proofHash,
      resultMetadataHash: reserveResult.resultMetadataHash,
      workerSignedAt: signature.workerSignedAt,
      signature: signature.signature,
      verifiedWith: reserveResult.verifiedWith,
      receipt,
    });

    return updateJob(job.id, {
      status: "completed",
      outcome: reserveResult.outcome,
      thresholdMet: reserveResult.thresholdMet,
      proofHash: reserveResult.proofHash,
      resultMetadataHash: reserveResult.resultMetadataHash,
      receipt,
      signature: signature.signature,
      signerAddress: signature.signerAddress,
      workerSignedAt: signature.workerSignedAt,
      callbackStatus: callback.callbackStatus,
      callbackError: callback.callbackError,
    });
  } catch (error) {
    return updateJob(job.id, {
      status: "failed",
      callbackStatus: "failed",
      callbackError: error instanceof Error ? error.message : "Proof job processing failed",
    });
  }
}
