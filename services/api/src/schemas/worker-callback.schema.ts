import { z } from "zod";

export const workerProofResultSchema = z.object({
  proofRequestId: z.string().min(1),
  status: z.enum(["PASS", "FAIL"]),
  thresholdMet: z.boolean(),
  proofHash: z.string().min(1),
  resultMetadataHash: z.string().min(1).optional(),
  workerSignedAt: z.number().int().positive(),
  signature: z.string().min(1),
  verifiedWith: z.array(z.string().min(1)).min(1),
  receipt: z.record(z.string(), z.unknown()).optional(),
});

export type WorkerProofResultInput = z.infer<typeof workerProofResultSchema>;
