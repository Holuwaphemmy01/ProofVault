import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import { assetsRoutes } from "./routes/assets.routes.js";
import { contractRoutes } from "./routes/contract.routes.js";
import { healthRoutes } from "./routes/health.routes.js";
import { projectsRoutes } from "./routes/projects.routes.js";
import { proofRequestsRoutes } from "./routes/proof-requests.routes.js";
import { publicRoutes } from "./routes/public.routes.js";
import { workerCallbacksRoutes } from "./routes/worker-callbacks.routes.js";

export async function buildApp() {
  const app = Fastify({
    logger: true,
    ajv: {
      customOptions: {
        strict: false,
      },
    },
  });

  await app.register(cors, {
    origin: true,
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "ProofVault API",
        description: "Backend API for ProofVault project metadata, proof requests, worker callbacks, and public proof lookup.",
        version: "0.1.0",
      },
      tags: [
        { name: "Health", description: "Service health checks" },
        { name: "Assets", description: "Supported asset metadata routes" },
        { name: "Projects", description: "Project metadata routes" },
        { name: "Proof Requests", description: "Reserve proof request metadata routes" },
        { name: "Contract", description: "ProofVaultRegistry contract status and event routes" },
        { name: "Worker Callbacks", description: "Worker proof result callback routes" },
        { name: "Public", description: "Public verifier routes" },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
  });

  await app.register(healthRoutes);
  await app.register(assetsRoutes);
  await app.register(projectsRoutes);
  await app.register(proofRequestsRoutes);
  await app.register(contractRoutes);
  await app.register(workerCallbacksRoutes);
  await app.register(publicRoutes);

  return app;
}
