import crypto from "node:crypto";
import {
  canonicalJson,
  privateProofPayloadSchema,
  sha256Hex,
  type EncryptedProofPayload,
  type PrivateProofPayload,
} from "@proofvault/proof-payload";
import { env } from "../lib/env.js";
import type {
  ConfidentialInputService,
  ResolveConfidentialInputContext,
} from "./confidential-input.interface.js";
import type { ProofJobInput } from "../schemas/proof-job.schema.js";

export class LocalDevInputService implements ConfidentialInputService {
  async resolve(input: ProofJobInput, _context: ResolveConfidentialInputContext) {
    return {
      mode: "local-dev" as const,
      privatePayload: toPrivatePayload(input),
    };
  }
}

export function decryptLocalDevProofPayload(encryptedProofPayload: EncryptedProofPayload) {
  if (!env.WORKER_ENCRYPTION_PRIVATE_KEY) {
    throw new Error("WORKER_ENCRYPTION_PRIVATE_KEY is required in local-dev confidential input mode");
  }

  if (encryptedProofPayload.keyId !== env.WORKER_ENCRYPTION_KEY_ID) {
    throw new Error("Encrypted payload keyId does not match worker key");
  }

  const aesKey = crypto.privateDecrypt(
    {
      key: normalizePem(env.WORKER_ENCRYPTION_PRIVATE_KEY),
      oaepHash: "sha256",
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    Buffer.from(encryptedProofPayload.encryptedKey, "base64"),
  );
  const iv = Buffer.from(encryptedProofPayload.iv, "base64");
  const ciphertextWithOptionalTag = Buffer.from(encryptedProofPayload.ciphertext, "base64");
  const authTag = encryptedProofPayload.authTag
    ? Buffer.from(encryptedProofPayload.authTag, "base64")
    : ciphertextWithOptionalTag.subarray(ciphertextWithOptionalTag.length - 16);
  const ciphertext = encryptedProofPayload.authTag
    ? ciphertextWithOptionalTag
    : ciphertextWithOptionalTag.subarray(0, ciphertextWithOptionalTag.length - 16);
  const decipher = crypto.createDecipheriv("aes-256-gcm", aesKey, iv);

  if (encryptedProofPayload.aad) {
    decipher.setAAD(Buffer.from(encryptedProofPayload.aad));
  }

  decipher.setAuthTag(authTag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
  const parsed = privateProofPayloadSchema.parse(JSON.parse(plaintext));
  const actualPayloadHash = sha256Hex(canonicalJson(parsed));

  if (actualPayloadHash !== encryptedProofPayload.payloadHash) {
    throw new Error("Encrypted payload hash mismatch");
  }

  return parsed;
}

function toPrivatePayload(input: ProofJobInput): PrivateProofPayload {
  if (input.encryptedProofPayload) {
    return decryptLocalDevProofPayload(input.encryptedProofPayload);
  }

  return {
    projectSlug: input.projectSlug,
    proofName: "Legacy Local Dev Proof Job",
    requiredThreshold: input.requiredThreshold ?? 0,
    thresholdCurrency: input.thresholdCurrency,
    selectedAssets: input.selectedAssets ?? [],
    wallets: (input.walletReferences ?? []).map((reference) => ({
      assetSymbol: reference.assetSymbol,
      chain: reference.chain,
      walletAddress: reference.walletAddressHash,
      sourceLabel: undefined,
    })),
    privateSalt: "legacy-local-dev-salt",
    createdAt: new Date().toISOString(),
  };
}

function normalizePem(value: string) {
  return value.replace(/\\n/g, "\n");
}
