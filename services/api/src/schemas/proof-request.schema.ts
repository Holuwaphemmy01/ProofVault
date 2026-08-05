import { z } from "zod";

export const walletReferenceSchema = z.object({
  assetSymbol: z.string().min(1),
  chain: z.string().min(1),
  sourceLabel: z.string().min(1).optional(),
  encryptedWalletReference: z.string().min(1),
  walletAddressHash: z.string().min(1),
  maskedWalletAddress: z.string().min(1).optional(),
  encryptionVersion: z.string().min(1).default("proofvault-v1"),
});

export const createProofRequestSchema = z.object({
  projectSlug: z.string().min(1),
  proofName: z.string().min(1),
  requiredThreshold: z.number().positive(),
  thresholdCurrency: z.string().min(1).default("USD"),
  selectedAssets: z.array(z.string().min(1)).min(1),
  privacyMode: z.enum([
    "confidential_threshold_proof",
    "partial_disclosure",
    "public_reserve_snapshot",
  ]),
  walletReferences: z.array(walletReferenceSchema).min(1),
});

export type CreateProofRequestInput = z.infer<typeof createProofRequestSchema>;
