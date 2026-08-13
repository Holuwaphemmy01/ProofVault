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

  validateThresholdInput(input);

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

  const requiredThreshold = parseNonNegativeInteger(input.requiredThreshold, "requiredThreshold");
  const total = input.assetValues.reduce((sum, value) => sum + parseNonNegativeInteger(value, "assetValues"), 0n);
  const thresholdMet = total >= requiredThreshold;
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

function validateThresholdInput(input: FccThresholdRequest) {
  if (!input.requestId.trim()) {
    throw new Error("FCC threshold requestId is required");
  }

  const requiredThreshold = parseNonNegativeInteger(input.requiredThreshold, "requiredThreshold");

  if (requiredThreshold <= 0n) {
    throw new Error("FCC threshold requiredThreshold must be greater than zero");
  }

  if (input.assetValues.length === 0) {
    throw new Error("FCC threshold assetValues must not be empty");
  }

  for (const value of input.assetValues) {
    parseNonNegativeInteger(value, "assetValues");
  }
}

function parseNonNegativeInteger(value: number | string, fieldName: string) {
  const normalized = typeof value === "number" ? String(value) : value.trim();

  if (!/^\d+$/.test(normalized)) {
    throw new Error(`FCC threshold ${fieldName} must be a non-negative integer`);
  }

  return BigInt(normalized);
}
