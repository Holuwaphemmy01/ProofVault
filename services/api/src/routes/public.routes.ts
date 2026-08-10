import type { FastifyInstance } from "fastify";
import { getProjectBySlug } from "../services/project.service.js";
import {
  getLatestProofResultByProjectSlug,
  getProofHistoryByProjectSlug,
} from "../services/worker-callback.service.js";

export async function publicRoutes(app: FastifyInstance) {
  app.get<{ Params: { slug: string } }>("/public/projects/:slug/latest-proof", {
    schema: {
      tags: ["Public"],
      summary: "Get latest public proof result for a project",
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
      const project = await getProjectBySlug(request.params.slug);

      if (!project) {
        return reply.status(404).send({ error: "Project not found" });
      }

      const result = await getLatestProofResultByProjectSlug(project.slug);

      if (!result) {
        return reply.status(404).send({ error: "Latest proof result not found" });
      }

      return {
        project: {
          name: project.name,
          slug: project.slug,
          projectType: project.projectType,
        },
        proofResult: result,
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: "Database operation failed" });
    }
  });

  app.get<{ Params: { slug: string } }>("/public/projects/:slug/proof-history", {
    schema: {
      tags: ["Public"],
      summary: "Get public proof history for a project",
      description: "Returns historical public proof results only. The response excludes wallet addresses, balances, reserve composition, private computation traces, and encrypted payload contents.",
      params: {
        type: "object",
        required: ["slug"],
        properties: {
          slug: { type: "string", example: "atlasx-exchange" },
        },
      },
      response: {
        200: {
          type: "object",
          required: ["success", "projectSlug", "proofs"],
          properties: {
            success: { type: "boolean" },
            projectSlug: { type: "string" },
            proofs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  requestId: { type: "string" },
                  status: { type: "string", enum: ["PASS", "FAIL", "PENDING"] },
                  thresholdMet: { type: "boolean" },
                  proofHash: { type: "string" },
                  transactionHash: { type: "string", nullable: true },
                  onChainResultId: { type: "string", nullable: true },
                  onChainRequestId: { type: "string", nullable: true },
                  verifiedAt: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const project = await getProjectBySlug(request.params.slug);

      if (!project) {
        return reply.status(404).send({ error: "Project not found" });
      }

      return {
        success: true,
        projectSlug: project.slug,
        proofs: await getProofHistoryByProjectSlug(project.slug),
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: "Database operation failed" });
    }
  });
}
