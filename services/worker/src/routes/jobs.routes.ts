import type { FastifyInstance } from "fastify";
import { proofJobSchema } from "../schemas/proof-job.schema.js";
import { getJob } from "../lib/in-memory-job-store.js";
import { processProofJob } from "../services/proof-worker.service.js";

export async function jobsRoutes(app: FastifyInstance) {
  app.post("/jobs/proof", {
    schema: {
      body: {
        type: "object",
        required: ["proofRequestId", "onChainRequestId", "projectSlug", "requiredThreshold", "selectedAssets", "walletReferences"],
        properties: {
          proofRequestId: { type: "string", example: "database-proof-request-id" },
          onChainRequestId: { type: "string", example: "1" },
          projectSlug: { type: "string", example: "atlasx-exchange" },
          requiredThreshold: { type: "number", example: 1000000 },
          thresholdCurrency: { type: "string", default: "USD", example: "USD" },
          selectedAssets: { type: "array", items: { type: "string" }, example: ["BTC", "FLR"] },
          walletReferences: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              required: ["assetSymbol", "chain", "encryptedWalletReference", "walletAddressHash"],
              properties: {
                assetSymbol: { type: "string", example: "BTC" },
                chain: { type: "string", example: "bitcoin" },
                encryptedWalletReference: { type: "string", example: "0xencryptedbtcwalletreference" },
                walletAddressHash: { type: "string", example: "0xwalletaddresshashbtc" },
                maskedWalletAddress: { type: "string", example: "bc1q...k42p" },
                encryptionVersion: { type: "string", default: "proofvault-v1", example: "proofvault-v1" },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const parsed = proofJobSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid proof job payload" });
    }

    const job = await processProofJob(parsed.data);
    const statusCode = job?.status === "failed" ? 500 : 202;

    return reply.status(statusCode).send({
      success: job?.status !== "failed",
      job,
    });
  });

  app.get<{ Params: { id: string } }>("/jobs/:id", async (request, reply) => {
    const job = getJob(request.params.id);

    if (!job) {
      return reply.status(404).send({ error: "Job not found" });
    }

    return { job };
  });
}
