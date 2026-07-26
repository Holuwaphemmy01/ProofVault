import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requestWorkerVerification } from "../lib/worker-client.js";

const createProofSchema = z.object({
  projectName: z.string().min(1).default("ProofVault Demo"),
  threshold: z.number().positive().default(1_000_000),
});

export async function proofRoutes(app: FastifyInstance) {
  app.post("/proofs", async (request) => {
    const body = createProofSchema.parse(request.body ?? {});

    return {
      id: "proof_demo_001",
      projectName: body.projectName,
      threshold: body.threshold,
      status: "pending",
      message: "Mock proof request created",
    };
  });

  app.get("/proofs/:id", async (request) => {
    const { id } = request.params as { id: string };

    return {
      id,
      projectName: "ProofVault Demo",
      status: "passed",
      proofHash: "0xmockproofhash",
      timestamp: new Date().toISOString(),
    };
  });

  app.post("/proofs/:id/verify", async (request) => {
    const { id } = request.params as { id: string };
    const verification = await requestWorkerVerification(id);

    return {
      id,
      ...verification,
    };
  });

  app.get("/public/:projectSlug", async (request) => {
    const { projectSlug } = request.params as { projectSlug: string };

    return {
      projectSlug,
      projectName: "ProofVault Demo",
      reserveStatus: "passed",
      proofHash: "0xmockproofhash",
      timestamp: new Date().toISOString(),
      publicOnly: true,
    };
  });
}
