import type { FastifyInstance } from "fastify";
import { SUPPORTED_ASSETS } from "@proofvault/config";

export async function assetsRoutes(app: FastifyInstance) {
  app.get("/assets", {
    schema: {
      tags: ["Assets"],
      summary: "List supported ProofVault assets",
    },
  }, async () => ({
    assets: SUPPORTED_ASSETS,
  }));
}
