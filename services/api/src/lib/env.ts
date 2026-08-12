import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  API_PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.string().default("development"),
  RPC_URL: z.string().default("http://127.0.0.1:8545"),
  COSTON2_RPC_URL: z.string().default("https://coston2-api.flare.network/ext/C/rpc"),
  FLARE_CONTRACT_REGISTRY_ADDRESS: z.string().default("0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019"),
  PROOFVAULT_REGISTRY_ADDRESS: z.string().default(""),
  RELAYER_PRIVATE_KEY: z.string().default(""),
  CONTRACT_WRITE_MODE: z.enum(["relayer"]).default("relayer"),
});

export const env = envSchema.parse({
  API_PORT: process.env.API_PORT,
  NODE_ENV: process.env.NODE_ENV,
  RPC_URL: process.env.RPC_URL,
  COSTON2_RPC_URL: process.env.COSTON2_RPC_URL,
  FLARE_CONTRACT_REGISTRY_ADDRESS: process.env.FLARE_CONTRACT_REGISTRY_ADDRESS,
  PROOFVAULT_REGISTRY_ADDRESS: process.env.PROOFVAULT_REGISTRY_ADDRESS,
  RELAYER_PRIVATE_KEY: process.env.RELAYER_PRIVATE_KEY,
  CONTRACT_WRITE_MODE: process.env.CONTRACT_WRITE_MODE,
});
