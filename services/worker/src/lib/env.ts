import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  WORKER_PORT: z.coerce.number().int().positive().default(4100),
  NODE_ENV: z.string().default("development"),
  API_BASE_URL: z.string().default("http://localhost:4000"),
  WORKER_PRIVATE_KEY: z.string().default(""),
  WORKER_ENCRYPTION_PRIVATE_KEY: z.string().default(""),
  WORKER_ENCRYPTION_KEY_ID: z.string().default("proofvault-worker-local-v1"),
  PROOFVAULT_REGISTRY_ADDRESS: z.string().default(""),
  CHAIN_ID: z.coerce.number().int().positive().default(31337),
  MOCK_CONFIDENTIAL_COMPUTE: z.coerce.boolean().default(true),
});

export const env = envSchema.parse({
  WORKER_PORT: process.env.WORKER_PORT,
  NODE_ENV: process.env.NODE_ENV,
  API_BASE_URL: process.env.API_BASE_URL,
  WORKER_PRIVATE_KEY: process.env.WORKER_PRIVATE_KEY,
  WORKER_ENCRYPTION_PRIVATE_KEY: process.env.WORKER_ENCRYPTION_PRIVATE_KEY,
  WORKER_ENCRYPTION_KEY_ID: process.env.WORKER_ENCRYPTION_KEY_ID,
  PROOFVAULT_REGISTRY_ADDRESS: process.env.PROOFVAULT_REGISTRY_ADDRESS,
  CHAIN_ID: process.env.CHAIN_ID,
  MOCK_CONFIDENTIAL_COMPUTE: process.env.MOCK_CONFIDENTIAL_COMPUTE,
});
