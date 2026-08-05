import { z } from "zod";
import {
  encryptedProofPayloadAlgorithm,
  encryptedProofPayloadVersion,
} from "./encryption.types.js";

export const privateWalletPayloadSchema = z.object({
  assetSymbol: z.string().min(1),
  chain: z.string().min(1),
  walletAddress: z.string().min(1),
  sourceLabel: z.string().min(1).optional(),
  privateMetadata: z.record(z.string(), z.unknown()).optional(),
});

export const privateProofPayloadSchema = z.object({
  projectSlug: z.string().min(1),
  proofName: z.string().min(1),
  requiredThreshold: z.number().positive(),
  thresholdCurrency: z.string().min(1).default("USD"),
  selectedAssets: z.array(z.string().min(1)).min(1),
  wallets: z.array(privateWalletPayloadSchema).min(1),
  privateSalt: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const encryptedProofPayloadSchema = z.object({
  version: z.literal(encryptedProofPayloadVersion),
  algorithm: z.literal(encryptedProofPayloadAlgorithm),
  keyId: z.string().min(1),
  encryptedKey: z.string().min(1),
  iv: z.string().min(1),
  ciphertext: z.string().min(1),
  authTag: z.string().min(1).optional(),
  aad: z.string().min(1).optional(),
  payloadHash: z.string().regex(/^0x[0-9a-fA-F]{64}$/),
  createdAt: z.string().datetime(),
});

export const publicWalletReferenceSummarySchema = z.object({
  assetSymbol: z.string().min(1),
  chain: z.string().min(1),
  sourceLabel: z.string().min(1).optional(),
  walletAddressHash: z.string().min(1),
  maskedWalletAddress: z.string().min(1).optional(),
  encryptionVersion: z.string().min(1).optional(),
  validationStatus: z.string().min(1).optional(),
}).strict();

export type PrivateProofPayload = z.infer<typeof privateProofPayloadSchema>;
export type EncryptedProofPayload = z.infer<typeof encryptedProofPayloadSchema>;
export type PublicWalletReferenceSummary = z.infer<typeof publicWalletReferenceSummarySchema>;
