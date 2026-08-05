import type { ProofJobInput } from "../schemas/proof-job.schema.js";
import { sha256Hex } from "../lib/hash.js";
import { createJob, updateJob } from "../lib/in-memory-job-store.js";
import { sendWorkerCallback } from "./callback.service.js";
import { runMockConfidentialCompute } from "./mock-confidential-compute.service.js";
import { signProofResult } from "./signature.service.js";

export async function processProofJob(input: ProofJobInput) {
  const job = createJob(input);

  try {
    updateJob(job.id, {
      status: "processing",
    });

    const computeResult = runMockConfidentialCompute(input);
    const workerSignedAt = Math.floor(Date.now() / 1000);
    const proofHash = sha256Hex(JSON.stringify({
      proofRequestId: input.proofRequestId,
      onChainRequestId: input.onChainRequestId,
      projectSlug: input.projectSlug,
      selectedAssets: input.selectedAssets,
      thresholdMet: computeResult.thresholdMet,
      outcome: computeResult.outcome,
      workerSignedAt,
    }));
    const resultMetadataHash = sha256Hex(JSON.stringify({
      status: computeResult.outcome,
      thresholdMet: computeResult.thresholdMet,
      verifiedWith: computeResult.verifiedWith,
      privacyMode: "confidential_threshold_proof",
    }));
    const signature = await signProofResult({
      onChainRequestId: input.onChainRequestId,
      proofHash,
      outcome: computeResult.outcome,
      resultMetadataHash,
      workerSignedAt,
    });
    const callback = await sendWorkerCallback({
      proofRequestId: input.proofRequestId,
      outcome: computeResult.outcome,
      thresholdMet: computeResult.thresholdMet,
      proofHash,
      workerSignedAt: signature.workerSignedAt,
      signature: signature.signature,
      verifiedWith: computeResult.verifiedWith,
    });

    return updateJob(job.id, {
      status: "completed",
      outcome: computeResult.outcome,
      thresholdMet: computeResult.thresholdMet,
      proofHash,
      resultMetadataHash,
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
