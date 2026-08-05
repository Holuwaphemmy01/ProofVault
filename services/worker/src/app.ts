import cors from "@fastify/cors";
import Fastify from "fastify";
import { healthRoutes } from "./routes/health.routes.js";
import { jobsRoutes } from "./routes/jobs.routes.js";

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

  await app.register(healthRoutes);
  await app.register(jobsRoutes);

  return app;
}
