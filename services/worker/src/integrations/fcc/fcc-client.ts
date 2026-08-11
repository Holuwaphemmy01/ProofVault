import { env } from "../../lib/env.js";
import type { ProofOutcome } from "../../types/worker.types.js";
import type { EncryptedProofPayload } from "@proofvault/proof-payload";

export type FccThresholdRequest = {
  requestId: string;
  requiredThreshold: number;
  assetValues: number[];
  commitment: string;
};

export type FccThresholdResponse = {
  thresholdMet: boolean;
  outcome: ProofOutcome;
  outputCommitment: string;
  timestamp?: number;
  executionReference?: string;
  extensionId?: string;
};

export type FccConfidentialProofRequest = {
  proofRequestId: string;
  onChainRequestId: string;
  projectSlug: string;
  encryptedPayload: EncryptedProofPayload;
  payloadHash: string;
  thresholdCommitment?: string;
  selectedAssetsHash?: string;
  workerSignedAt: number;
};

type FccClientOptions = {
  endpoint?: string;
  extensionId?: string;
  fetchFn?: typeof fetch;
  timeoutMs?: number;
};

export class FccClient {
  private readonly endpoint: string;
  private readonly extensionId: string;
  private readonly fetchFn: typeof fetch;
  private readonly timeoutMs: number;

  constructor(options: FccClientOptions = {}) {
    this.endpoint = options.endpoint ?? env.FCC_EXTENSION_ENDPOINT;
    this.extensionId = options.extensionId ?? env.FCC_EXTENSION_ID;
    this.fetchFn = options.fetchFn ?? fetch;
    this.timeoutMs = options.timeoutMs ?? env.FCC_TIMEOUT_MS;

    if (!this.endpoint) {
      throw new Error("FCC_EXTENSION_ENDPOINT is required for live FCC execution");
    }
  }

  async verifyReserveThreshold(input: FccThresholdRequest): Promise<FccThresholdResponse> {
    return this.postAction("VERIFY_RESERVE_THRESHOLD", "verifyReserveThreshold", input);
  }

  async executeConfidentialProof(input: FccConfidentialProofRequest): Promise<FccThresholdResponse> {
    return this.postAction("VERIFY_CONFIDENTIAL_PROOF", "verifyReserveThreshold", {
      proofRequestId: input.proofRequestId,
      onChainRequestId: input.onChainRequestId,
      projectSlug: input.projectSlug,
      confidentialInput: {
        version: input.encryptedPayload.version,
        algorithm: input.encryptedPayload.algorithm,
        keyId: input.encryptedPayload.keyId,
        ciphertext: input.encryptedPayload.ciphertext,
        encryptedKey: input.encryptedPayload.encryptedKey,
        iv: input.encryptedPayload.iv,
        authTag: input.encryptedPayload.authTag,
        aad: input.encryptedPayload.aad,
        payloadHash: input.payloadHash,
      },
      commitments: {
        thresholdCommitment: input.thresholdCommitment,
        selectedAssetsHash: input.selectedAssetsHash,
      },
      workerSignedAt: input.workerSignedAt,
    });
  }

  private async postAction(opCommand: string, action: string, input: unknown): Promise<FccThresholdResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchFn(resolveActionUrl(this.endpoint), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          extensionId: this.extensionId || undefined,
          opType: "PROOFVAULT_RESERVE",
          opCommand,
          action,
          input,
        }),
      });

      if (!response.ok) {
        throw new Error(`FCC extension request failed with status ${response.status}`);
      }

      const raw = await response.json() as unknown;
      assertNoPrivateValueLeak(raw);
      const result = extractThresholdResult(raw);

      return result;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("FCC threshold execution timed out");
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

function extractThresholdResult(raw: unknown): FccThresholdResponse {
  const value = unwrapResult(raw);

  if (!value || typeof value !== "object") {
    throw new Error("FCC extension returned malformed threshold result");
  }

  const result = value as Partial<FccThresholdResponse>;

  if (typeof result.thresholdMet !== "boolean") {
    throw new Error("FCC extension result missing thresholdMet");
  }

  if (result.outcome !== "PASS" && result.outcome !== "FAIL") {
    throw new Error("FCC extension result missing outcome");
  }

  if (!isBytes32(result.outputCommitment)) {
    throw new Error("FCC extension result missing outputCommitment");
  }

  return {
    thresholdMet: result.thresholdMet,
    outcome: result.outcome,
    outputCommitment: result.outputCommitment,
    timestamp: typeof result.timestamp === "number" ? result.timestamp : undefined,
    executionReference: typeof result.executionReference === "string" ? result.executionReference : undefined,
    extensionId: typeof result.extensionId === "string" ? result.extensionId : undefined,
  };
}

function unwrapResult(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") {
    return raw;
  }

  const value = raw as Record<string, unknown>;
  return value.result ?? value.output ?? value.data ?? raw;
}

function assertNoPrivateValueLeak(result: unknown) {
  const serialized = JSON.stringify(result);
  const forbidden = ["assetValues", "totalReserve", "totalReserveValue", "totalReserveUSD", "balances", "wallet"];

  for (const key of forbidden) {
    if (serialized.includes(key)) {
      throw new Error("FCC extension returned private reserve data");
    }
  }
}

function resolveActionUrl(endpoint: string) {
  const trimmed = endpoint.replace(/\/$/, "");
  return trimmed.endsWith("/action") ? trimmed : `${trimmed}/action`;
}

function isBytes32(value: unknown): value is string {
  return typeof value === "string" && /^0x[0-9a-fA-F]{64}$/.test(value);
}
