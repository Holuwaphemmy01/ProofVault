import { z } from "zod";

export const walletReferenceSchema = z.object({
  assetSymbol: z.string().min(1),
  chain: z.string().min(1),
  encryptedWalletReference: z.string().min(1),
  walletAddressHash: z.string().min(1),
  maskedWalletAddress: z.string().min(1).optional(),
  encryptionVersion: z.string().min(1).default("proofvault-v1"),
});

export const proofJobSchema = z.object({
  proofRequestId: z.string().min(1),
  onChainRequestId: z.string().min(1),
  projectSlug: z.string().min(1),
  requiredThreshold: z.number().positive(),
  thresholdCurrency: z.string().min(1).default("USD"),
  selectedAssets: z.array(z.string().min(1)).min(1),
  walletReferences: z.array(walletReferenceSchema).min(1),
});

export type ProofJobInput = z.infer<typeof proofJobSchema>;
