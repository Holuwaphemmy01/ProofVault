import { z } from "zod";
import { encryptedProofPayloadSchema } from "@proofvault/proof-payload";

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
  projectName: z.string().min(1).optional(),
  projectSlug: z.string().min(1),
  thresholdCommitment: z.string().min(1).optional(),
  selectedAssetsHash: z.string().min(1).optional(),
  encryptedPayloadHash: z.string().min(1).optional(),
  encryptedProofPayload: encryptedProofPayloadSchema.optional(),
  requiredThreshold: z.number().positive().optional(),
  thresholdCurrency: z.string().min(1).default("USD"),
  selectedAssets: z.array(z.string().min(1)).min(1).optional(),
  walletReferences: z.array(walletReferenceSchema).min(1).optional(),
}).superRefine((value, context) => {
  if (value.encryptedProofPayload) {
    return;
  }

  if (value.requiredThreshold === undefined) {
    context.addIssue({
      code: "custom",
      path: ["requiredThreshold"],
      message: "requiredThreshold is required for legacy proof jobs",
    });
  }

  if (!value.selectedAssets?.length) {
    context.addIssue({
      code: "custom",
      path: ["selectedAssets"],
      message: "selectedAssets is required for legacy proof jobs",
    });
  }

  if (!value.walletReferences?.length) {
    context.addIssue({
      code: "custom",
      path: ["walletReferences"],
      message: "walletReferences is required for legacy proof jobs",
    });
  }
});

export type ProofJobInput = z.infer<typeof proofJobSchema>;
