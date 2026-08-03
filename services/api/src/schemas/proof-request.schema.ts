import { z } from "zod";

export const createProofRequestSchema = z.object({
  projectSlug: z.string().min(1),
  proofName: z.string().min(1),
  requiredThreshold: z.number().positive(),
  thresholdCurrency: z.string().min(1),
  selectedAssets: z.array(z.string().min(1)).min(1),
  privacyMode: z.enum([
    "confidential_threshold_proof",
    "partial_disclosure",
    "public_reserve_snapshot",
  ]),
});

export type CreateProofRequestInput = z.infer<typeof createProofRequestSchema>;
