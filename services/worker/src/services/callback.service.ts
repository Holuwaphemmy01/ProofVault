import { env } from "../lib/env.js";
import type { ProofOutcome } from "../types/worker.types.js";

type SendWorkerCallbackInput = {
  proofRequestId: string;
  outcome: ProofOutcome;
  thresholdMet: boolean;
  proofHash: string;
  workerSignedAt: number;
  signature: string;
  verifiedWith: string[];
};

export async function sendWorkerCallback(input: SendWorkerCallbackInput) {
  if (!env.API_BASE_URL) {
    return {
      callbackStatus: "skipped" as const,
    };
  }

  try {
    const response = await fetch(`${env.API_BASE_URL}/worker/callbacks/proof-result`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        proofRequestId: input.proofRequestId,
        status: input.outcome,
        thresholdMet: input.thresholdMet,
        proofHash: input.proofHash,
        workerSignedAt: input.workerSignedAt,
        signature: input.signature,
        verifiedWith: input.verifiedWith,
      }),
    });

    if (!response.ok) {
      return {
        callbackStatus: "failed" as const,
        callbackError: `Backend callback failed with status ${response.status}`,
      };
    }

    return {
      callbackStatus: "sent" as const,
    };
  } catch (error) {
    return {
      callbackStatus: "failed" as const,
      callbackError: error instanceof Error ? error.message : "Backend callback failed",
    };
  }
}
