import type { ProofJobInput } from "../schemas/proof-job.schema.js";
import type { PrivateProofPayload } from "@proofvault/proof-payload";
import { createJob, updateJob } from "../lib/in-memory-job-store.js";
import { env } from "../lib/env.js";
import { sendWorkerCallback } from "./callback.service.js";
import { calculatePrivateReserve } from "./private-reserve-calculation.service.js";
import { generateProofReceipt } from "./receipt.service.js";
import { signProofResult } from "./signature.service.js";
import {
  requiresFdcAddressValidity,
  validateExternalAddress,
} from "../integrations/fdc/address-validity.service.js";
import {
  hasPaymentEvidence,
  verifyPaymentAttestation,
} from "../integrations/fdc/payment-attestation.service.js";
import { getConfidentialInputService } from "../confidential-input/confidential-input.factory.js";
import type { ProofComputationResult } from "../confidential-input/confidential-input.interface.js";

export async function processProofJob(input: ProofJobInput) {
  const job = createJob(input);

  try {
    updateJob(job.id, {
      status: "processing",
    });

    const workerSignedAt = Math.floor(Date.now() / 1000);
    const confidentialInput = await getConfidentialInputService().resolve(input, {
      workerSignedAt,
      verifiedWith: [],
    });
    let reserveResult: ProofComputationResult;
    let receiptProjectName = input.projectName ?? input.projectSlug;

    if (confidentialInput.mode === "local-dev") {
      const privatePayload = confidentialInput.privatePayload;
      const fdcValidationCount = await validateExternalWalletSources(privatePayload);
      const fdcPaymentCount = await validatePaymentEvidence(privatePayload);

      receiptProjectName = input.projectName ?? privatePayload.projectSlug;
      reserveResult = await calculatePrivateReserve({
        proofRequestId: input.proofRequestId,
        onChainRequestId: input.onChainRequestId,
        projectSlug: input.projectSlug,
        workerSignedAt,
        privatePayload,
        verifiedWith: [
          ...(fdcValidationCount > 0 ? ["FDC_ADDRESS_VALIDITY"] : []),
          ...(fdcPaymentCount > 0 ? ["FDC_PAYMENT"] : []),
        ],
        dataSources: [
          ...(fdcValidationCount > 0 || fdcPaymentCount > 0 ? ["FDC"] : []),
        ],
      });
    } else {
      reserveResult = confidentialInput.reserveResult;
    }

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
      projectName: receiptProjectName,
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
      verifiedWith: reserveResult.verifiedWith,
      dataSources: reserveResult.dataSources,
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
      dataSources: reserveResult.dataSources,
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

async function validateExternalWalletSources(privatePayload: PrivateProofPayload) {
  let validatedCount = 0;

  for (const wallet of privatePayload.wallets) {
    if (!requiresFdcAddressValidity(wallet.chain)) {
      continue;
    }

    await validateExternalAddress({
      chain: wallet.chain,
      address: wallet.walletAddress,
    });
    validatedCount += 1;
  }

  return validatedCount;
}

async function validatePaymentEvidence(privatePayload: PrivateProofPayload) {
  let verifiedCount = 0;

  for (const wallet of privatePayload.wallets) {
    if (!hasPaymentEvidence(wallet.paymentEvidence)) {
      continue;
    }

    await verifyPaymentAttestation(wallet.paymentEvidence);
    verifiedCount += 1;
  }

  return verifiedCount;
}
