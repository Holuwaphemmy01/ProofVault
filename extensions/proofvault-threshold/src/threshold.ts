import { createHash } from "crypto";

export type ThresholdRequest = {
  requestId: string;
  requiredThreshold: string;
  assetValues: string[];
  commitment: string;
};

export type ThresholdResponse = {
  requestId: string;
  thresholdMet: boolean;
  outcome: "PASS" | "FAIL";
  outputCommitment: string;
  computeSource: "FCC";
  timestamp: number;
  executionReference: string;
};

export function verifyReserveThreshold(input: ThresholdRequest): ThresholdResponse {
  if (!input.requestId || !input.requestId.trim()) {
    throw new Error("requestId is required");
  }

  const requiredThreshold = parsePositiveInteger(input.requiredThreshold, "requiredThreshold");

  if (!Array.isArray(input.assetValues) || input.assetValues.length === 0) {
    throw new Error("assetValues must not be empty");
  }

  let total = 0n;

  for (const value of input.assetValues) {
    total += parseNonNegativeInteger(value, "assetValues");
  }

  const thresholdMet = total >= requiredThreshold;
  const outcome = thresholdMet ? "PASS" : "FAIL";
  const timestamp = Math.floor(Date.now() / 1000);
  const outputCommitment = sha256Hex(canonicalJson({
    requestId: input.requestId,
    inputCommitment: input.commitment,
    thresholdMet,
    outcome,
    computeSource: "FCC",
    timestamp,
  }));

  return {
    requestId: input.requestId,
    thresholdMet,
    outcome,
    outputCommitment,
    computeSource: "FCC",
    timestamp,
    executionReference: `proofvault-threshold:${input.requestId}:${timestamp}`,
  };
}

function parsePositiveInteger(value: string, fieldName: string) {
  const parsed = parseNonNegativeInteger(value, fieldName);

  if (parsed <= 0n) {
    throw new Error(`${fieldName} must be greater than zero`);
  }

  return parsed;
}

function parseNonNegativeInteger(value: string, fieldName: string) {
  if (typeof value !== "string" || !/^\d+$/.test(value.trim())) {
    throw new Error(`${fieldName} must be a non-negative integer string`);
  }

  return BigInt(value);
}

function sha256Hex(value: string) {
  return `0x${createHash("sha256").update(value).digest("hex")}`;
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(",")}}`;
  }

  return JSON.stringify(value);
}
