import { z } from "zod";
import {
  encryptedProofPayloadSchema,
  publicWalletReferenceSummarySchema,
} from "@proofvault/proof-payload";

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
  requiredThreshold: z.number().positive().optional(),
  thresholdCurrency: z.string().min(1).default("USD"),
  selectedAssets: z.array(z.string().min(1)).min(1),
  privacyMode: z.enum([
    "confidential_threshold_proof",
    "partial_disclosure",
    "public_reserve_snapshot",
  ]),
  encryptedProofPayload: encryptedProofPayloadSchema.optional(),
  walletReferenceSummaries: z.array(publicWalletReferenceSummarySchema).min(1).optional(),
  walletReferences: z.array(walletReferenceSchema).min(1).optional(),
}).superRefine((value, context) => {
  if (value.encryptedProofPayload) {
    if (!value.walletReferenceSummaries?.length) {
      context.addIssue({
        code: "custom",
        path: ["walletReferenceSummaries"],
        message: "walletReferenceSummaries is required when encryptedProofPayload is provided",
      });
    }

    return;
  }

  if (value.requiredThreshold === undefined) {
    context.addIssue({
      code: "custom",
      path: ["requiredThreshold"],
      message: "requiredThreshold is required for legacy proof requests",
    });
  }

  if (!value.walletReferences?.length) {
    context.addIssue({
      code: "custom",
      path: ["walletReferences"],
      message: "walletReferences is required for legacy proof requests",
    });
  }
});

export type CreateProofRequestInput = z.infer<typeof createProofRequestSchema>;
