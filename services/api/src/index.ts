import cors from "@fastify/cors";
import dotenv from "dotenv";
import Fastify from "fastify";
import { proofRoutes } from "./routes/proofs.js";

dotenv.config();

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: true,
});

app.get("/health", async () => ({
  status: "ok",
  service: "proofvault-api",
}));

await app.register(proofRoutes);

const port = Number(process.env.API_PORT || 4000);

try {
  await app.listen({ port, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
