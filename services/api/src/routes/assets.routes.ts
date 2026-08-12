import type { FastifyInstance } from "fastify";
import { getSupportedFlareAssets } from "../services/flare-assets.service.js";

export async function assetsRoutes(app: FastifyInstance) {
  app.get("/assets", {
    schema: {
      tags: ["Assets"],
      summary: "List supported ProofVault assets",
    },
  }, async () => ({
    assets: await getSupportedFlareAssets(),
  }));
}
