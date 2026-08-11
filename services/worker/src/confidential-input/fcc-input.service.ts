import { canonicalJson, sha256Hex } from "@proofvault/proof-payload";
import { env } from "../lib/env.js";
import type { ProofJobInput } from "../schemas/proof-job.schema.js";
import { FccClient } from "../integrations/fcc/fcc-client.js";
import type {
  ConfidentialInputService,
  ResolveConfidentialInputContext,
} from "./confidential-input.interface.js";

export class FccInputService implements ConfidentialInputService {
  constructor(private readonly client = new FccClient()) {}

  async resolve(input: ProofJobInput, context: ResolveConfidentialInputContext) {
    if (!input.encryptedProofPayload) {
      throw new Error("encryptedProofPayload is required in FCC confidential input mode");
    }

    const payloadHash = input.encryptedPayloadHash ?? input.encryptedProofPayload.payloadHash;
    const result = await this.client.executeConfidentialProof({
      proofRequestId: input.proofRequestId,
      onChainRequestId: input.onChainRequestId,
      projectSlug: input.projectSlug,
      encryptedPayload: input.encryptedProofPayload,
      payloadHash,
      thresholdCommitment: input.thresholdCommitment,
      selectedAssetsHash: input.selectedAssetsHash,
      workerSignedAt: context.workerSignedAt,
    });
    const verifiedWith = [...context.verifiedWith, "FCC"];
    const resultMetadataHash = sha256Hex(canonicalJson({
      status: result.outcome,
      thresholdMet: result.thresholdMet,
      verifiedWith,
      computeSource: "fcc",
      executionReference: result.executionReference,
      privacyMode: "confidential_threshold_proof",
      payloadHash,
    }));

    return {
      mode: "fcc" as const,
      reserveResult: {
        outcome: result.outcome,
        thresholdMet: result.thresholdMet,
        proofHash: result.outputCommitment,
        resultMetadataHash,
        verifiedWith,
        computeSource: "fcc",
        executionReference: result.executionReference ?? (env.FCC_EXTENSION_ID || undefined),
      },
    };
  }
}
