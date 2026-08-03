import type { FastifyInstance } from "fastify";
import { getProjectBySlug } from "../services/project.service.js";
import { getLatestProofResultByProjectSlug } from "../services/worker-callback.service.js";

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
}
