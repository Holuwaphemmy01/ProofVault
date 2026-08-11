import type { PrivateProofPayload } from "@proofvault/proof-payload";
import type { ProofJobInput } from "../schemas/proof-job.schema.js";
import type { ProofOutcome } from "../types/worker.types.js";

export type ProofComputationResult = {
  outcome: ProofOutcome;
  thresholdMet: boolean;
  proofHash: string;
  resultMetadataHash: string;
  verifiedWith: string[];
  computeSource?: string;
  executionReference?: string;
};

export type ConfidentialInputResolution =
  | {
      mode: "local-dev";
      privatePayload: PrivateProofPayload;
    }
  | {
      mode: "fcc";
      reserveResult: ProofComputationResult;
    };

export type ResolveConfidentialInputContext = {
  workerSignedAt: number;
  verifiedWith: string[];
};

export interface ConfidentialInputService {
  resolve(input: ProofJobInput, context: ResolveConfidentialInputContext): Promise<ConfidentialInputResolution>;
}
