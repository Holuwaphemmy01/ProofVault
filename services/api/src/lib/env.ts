import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  API_PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.string().default("development"),
  RPC_URL: z.string().default("http://127.0.0.1:8545"),
  PROOFVAULT_REGISTRY_ADDRESS: z.string().default(""),
  RELAYER_PRIVATE_KEY: z.string().default(""),
  CONTRACT_WRITE_MODE: z.enum(["relayer"]).default("relayer"),
});

export const env = envSchema.parse({
  API_PORT: process.env.API_PORT,
  NODE_ENV: process.env.NODE_ENV,
  RPC_URL: process.env.RPC_URL,
  PROOFVAULT_REGISTRY_ADDRESS: process.env.PROOFVAULT_REGISTRY_ADDRESS,
  RELAYER_PRIVATE_KEY: process.env.RELAYER_PRIVATE_KEY,
  CONTRACT_WRITE_MODE: process.env.CONTRACT_WRITE_MODE,
});
