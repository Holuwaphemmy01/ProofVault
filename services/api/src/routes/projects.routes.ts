import type { FastifyInstance } from "fastify";
import { createProjectSchema } from "../schemas/project.schema.js";
import { createProject, getProjectProfileBySlug } from "../services/project.service.js";

export async function projectsRoutes(app: FastifyInstance) {
  app.post("/projects", {
    schema: {
      tags: ["Projects"],
      summary: "Create project metadata and attempt on-chain registration",
      description: "Saves project metadata in PostgreSQL and attempts to register the project in ProofVaultRegistry using the configured backend relayer wallet.",
      body: {
        type: "object",
        required: ["name", "slug", "website", "projectType", "ownerWallet"],
        properties: {
          name: { type: "string", example: "AtlasX Exchange" },
          slug: { type: "string", example: "atlasx-exchange" },
          website: { type: "string", format: "uri", example: "https://atlasx.exchange" },
          projectType: {
            type: "string",
            enum: ["exchange", "dao", "bridge", "lending_protocol", "stablecoin_issuer", "asset_backed_token", "other"],
            example: "exchange",
          },
          description: { type: "string", example: "Demo exchange using ProofVault" },
          ownerWallet: { type: "string", example: "0x92A7F13C00000000000000000000000000000000" },
        },
      },
    },
  }, async (request, reply) => {
    const parsed = createProjectSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid project payload" });
    }

    try {
      const project = await createProject(parsed.data);
      return reply.status(201).send({ success: true, ...project });
    } catch (error) {
      if (error instanceof Error && error.message === "Project slug already exists") {
        return reply.status(409).send({ error: error.message });
      }

      request.log.error(error);
      return reply.status(500).send({ error: "Database operation failed" });
    }
  });

  app.get<{ Params: { slug: string } }>("/projects/:slug", {
    schema: {
      tags: ["Projects"],
      summary: "Get project profile, on-chain registration status, and latest proof status",
      description: "Returns the database project profile plus ProofVaultRegistry registration and latest proof status when contract configuration is available.",
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
      const profile = await getProjectProfileBySlug(request.params.slug);

      if (!profile) {
        return reply.status(404).send({ error: "Project not found" });
      }

      return {
        success: true,
        ...profile,
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: "Database operation failed" });
    }
  });
}
