import type { ProofJobInput } from "../schemas/proof-job.schema.js";

export type ProofOutcome = "PASS" | "FAIL";
export type JobStatus = "received" | "processing" | "completed" | "failed";
export type CallbackStatus = "skipped" | "sent" | "failed";

export type PublicWorkerJob = {
  id: string;
  proofRequestId: string;
  projectSlug: string;
  status: JobStatus;
  outcome?: ProofOutcome;
  thresholdMet?: boolean;
  proofHash?: string;
  resultMetadataHash?: string;
  signature?: string;
  signerAddress?: string;
  workerSignedAt?: number;
  callbackStatus?: CallbackStatus;
  callbackError?: string;
  createdAt: string;
  updatedAt: string;
};

export type StoredWorkerJob = PublicWorkerJob & {
  input: ProofJobInput;
};
