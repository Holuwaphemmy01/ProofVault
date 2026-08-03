import type { FastifyInstance } from "fastify";
import { createProofRequestSchema } from "../schemas/proof-request.schema.js";
import { getProjectBySlug } from "../services/project.service.js";
import {
  createProofRequest,
  getProofRequestById,
  getProofRequestsByProjectSlug,
} from "../services/proof-request.service.js";

export async function proofRequestsRoutes(app: FastifyInstance) {
  app.post("/proof-requests", {
    schema: {
      tags: ["Proof Requests"],
      summary: "Create proof request metadata",
      body: {
        type: "object",
        required: ["projectSlug", "proofName", "requiredThreshold", "thresholdCurrency", "selectedAssets", "privacyMode"],
        properties: {
          projectSlug: { type: "string", example: "atlasx-exchange" },
          proofName: { type: "string", example: "July 2026 Reserve Verification" },
          requiredThreshold: { type: "number", example: 1000000 },
          thresholdCurrency: { type: "string", example: "USD" },
          selectedAssets: { type: "array", items: { type: "string" }, example: ["BTC", "FLR"] },
          privacyMode: {
            type: "string",
            enum: ["confidential_threshold_proof", "partial_disclosure", "public_reserve_snapshot"],
            example: "confidential_threshold_proof",
          },
        },
      },
    },
  }, async (request, reply) => {
    const parsed = createProofRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid proof request payload" });
    }

    try {
      if (!(await getProjectBySlug(parsed.data.projectSlug))) {
        return reply.status(404).send({ error: "Project not found" });
      }

      const proofRequest = await createProofRequest(parsed.data);
      return reply.status(201).send({ success: true, proofRequest });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: "Database operation failed" });
    }
  });

  app.get<{ Params: { id: string } }>("/proof-requests/:id", {
    schema: {
      tags: ["Proof Requests"],
      summary: "Get proof request metadata by ID",
      params: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "string", example: "proof-request-id" },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const proofRequest = await getProofRequestById(request.params.id);

      if (!proofRequest) {
        return reply.status(404).send({ error: "Proof request not found" });
      }

      return { proofRequest };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: "Database operation failed" });
    }
  });

  app.get<{ Params: { slug: string } }>("/projects/:slug/proof-requests", {
    schema: {
      tags: ["Proof Requests"],
      summary: "List proof requests for a project",
      params: {
        type: "object",
        required: ["slug"],
        properties: {
          slug: { type: "string", example: "atlasx-exchange" },
        },
      },
    },
  }, async (request, reply) => {
    try {
      if (!(await getProjectBySlug(request.params.slug))) {
        return reply.status(404).send({ error: "Project not found" });
      }

      return {
        proofRequests: await getProofRequestsByProjectSlug(request.params.slug),
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: "Database operation failed" });
    }
  });
}
