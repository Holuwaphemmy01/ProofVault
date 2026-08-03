import type { FastifyInstance } from "fastify";
import { workerProofResultSchema } from "../schemas/worker-callback.schema.js";
import { receiveWorkerProofResult } from "../services/worker-callback.service.js";

export async function workerCallbacksRoutes(app: FastifyInstance) {
  app.post("/worker/callbacks/proof-result", {
    schema: {
      tags: ["Worker Callbacks"],
      summary: "Receive worker proof result",
      body: {
        type: "object",
        required: ["proofRequestId", "status", "thresholdMet", "proofHash", "workerSignedAt", "signature", "verifiedWith"],
        properties: {
          proofRequestId: { type: "string", example: "proof-request-id" },
          status: { type: "string", enum: ["PASS", "FAIL"], example: "PASS" },
          thresholdMet: { type: "boolean", example: true },
          proofHash: { type: "string", example: "0xabc123" },
          workerSignedAt: { type: "number", example: 1785747060 },
          signature: { type: "string", example: "0xsignature" },
          verifiedWith: {
            type: "array",
            items: { type: "string" },
            example: ["FDC_ADDRESS_VALIDITY", "FDC_PAYMENT", "FTSO", "FCC"],
          },
        },
      },
    },
  }, async (request, reply) => {
    const parsed = workerProofResultSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid worker proof result payload" });
    }

    try {
      const result = await receiveWorkerProofResult(parsed.data);

      if (!result) {
        return reply.status(404).send({ error: "Proof request not found" });
      }

      return reply.status(201).send({
        success: true,
        message: "Worker proof result received",
        result,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: "Database operation failed" });
    }
  });
}
