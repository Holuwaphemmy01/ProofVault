import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
  app.get(
    "/health",
    {
      schema: {
        tags: ["Health"],
        summary: "Check API health",
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string", example: "ok" },
              service: { type: "string", example: "proofvault-api" },
              timestamp: { type: "string", format: "date-time" },
            },
            required: ["status", "service", "timestamp"],
          },
        },
      },
    },
    async () => ({
      status: "ok",
      service: "proofvault-api",
      timestamp: new Date().toISOString(),
    }),
  );
}
