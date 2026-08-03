import { z } from "zod";

export const workerProofResultSchema = z.object({
  proofRequestId: z.string().min(1),
  status: z.enum(["PASS", "FAIL"]),
  thresholdMet: z.boolean(),
  proofHash: z.string().min(1),
  workerSignedAt: z.number().int().positive(),
  signature: z.string().min(1),
  verifiedWith: z.array(z.string().min(1)).min(1),
});

export type WorkerProofResultInput = z.infer<typeof workerProofResultSchema>;
