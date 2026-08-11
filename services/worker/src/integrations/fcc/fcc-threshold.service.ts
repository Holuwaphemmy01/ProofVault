import { canonicalJson, sha256Hex } from "@proofvault/proof-payload";
import { env } from "../../lib/env.js";
import type { ProofOutcome } from "../../types/worker.types.js";
import { FccClient, type FccThresholdRequest } from "./fcc-client.js";

export type ThresholdComputeSource = "fcc" | "local-fallback";

export type ThresholdComputeResult = {
  thresholdMet: boolean;
  outcome: ProofOutcome;
  outputCommitment: string;
  timestamp: number;
  executionReference?: string;
  extensionId?: string;
  computeSource: ThresholdComputeSource;
};

type VerifyReserveThresholdInput = FccThresholdRequest & {
  client?: FccClient;
  mode?: "live" | "local";
  fallbackEnabled?: boolean;
};

export async function verifyReserveThreshold(input: VerifyReserveThresholdInput): Promise<ThresholdComputeResult> {
  const mode = input.mode ?? env.FCC_MODE;
  const fallbackEnabled = input.fallbackEnabled ?? env.FCC_FALLBACK_ENABLED;

  if (mode === "local") {
    return runLocalFallback(input, fallbackEnabled);
  }

  try {
    const client = input.client ?? new FccClient();
    const result = await client.verifyReserveThreshold(input);

    return {
      thresholdMet: result.thresholdMet,
      outcome: result.outcome,
      outputCommitment: result.outputCommitment,
      timestamp: result.timestamp ?? Math.floor(Date.now() / 1000),
      executionReference: result.executionReference,
      extensionId: result.extensionId ?? (env.FCC_EXTENSION_ID || undefined),
      computeSource: "fcc",
    };
  } catch (error) {
    if (!fallbackEnabled) {
      throw error;
    }

    return runLocalFallback(input, fallbackEnabled);
  }
}

function runLocalFallback(input: FccThresholdRequest, fallbackEnabled: boolean): ThresholdComputeResult {
  if (!fallbackEnabled) {
    throw new Error("FCC local fallback is not enabled");
  }

  const thresholdMet = input.assetValues.reduce((total, value) => total + value, 0) >= input.requiredThreshold;
  const outcome: ProofOutcome = thresholdMet ? "PASS" : "FAIL";
  const timestamp = Math.floor(Date.now() / 1000);
  const outputCommitment = sha256Hex(canonicalJson({
    requestId: input.requestId,
    commitment: input.commitment,
    thresholdMet,
    outcome,
    timestamp,
    computeSource: "local-fallback",
  }));

  return {
    thresholdMet,
    outcome,
    outputCommitment,
    timestamp,
    computeSource: "local-fallback",
  };
}
