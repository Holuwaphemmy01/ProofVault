import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const booleanEnv = z.preprocess((value) => {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  return value;
}, z.boolean());

const envSchema = z.object({
  WORKER_PORT: z.coerce.number().int().positive().default(4100),
  NODE_ENV: z.string().default("development"),
  API_BASE_URL: z.string().default("http://localhost:4000"),
  WORKER_PRIVATE_KEY: z.string().default(""),
  WORKER_ENCRYPTION_PRIVATE_KEY: z.string().default(""),
  WORKER_ENCRYPTION_KEY_ID: z.string().default("proofvault-worker-local-v1"),
  CONFIDENTIAL_INPUT_MODE: z.enum(["fcc", "local-dev"]).default("fcc"),
  PROOFVAULT_REGISTRY_ADDRESS: z.string().default(""),
  CHAIN_ID: z.coerce.number().int().positive().default(31337),
  MOCK_CONFIDENTIAL_COMPUTE: booleanEnv.default(true),
  FTSO_NETWORK: z.string().default("coston2"),
  FTSO_FALLBACK_ENABLED: booleanEnv.default(false),
  COSTON2_RPC_URL: z.string().default(""),
  FTSO_PRICE_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  FTSOV2_ADDRESS: z.string().default("0x3d893C53D9e8056135C26C8c638B76C8b60Df726"),
  FXRP_TOKEN_ADDRESS: z.string().default(""),
  FDC_VERIFIER_URL: z.string().default("https://fdc-verifiers-testnet.flare.network/"),
  FDC_DA_LAYER_URL: z.string().default("https://ctn2-data-availability.flare.network/"),
  FDC_API_KEY: z.string().default(""),
  FDC_CONTRACT_REGISTRY_ADDRESS: z.string().default("0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019"),
  FDC_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(10000),
  FDC_MAX_WAIT_MS: z.coerce.number().int().positive().default(240000),
  FCC_MODE: z.enum(["live", "local"]).default("live"),
  FCC_EXTENSION_ENDPOINT: z.string().default(""),
  FCC_EXTENSION_ID: z.string().default(""),
  FCC_FALLBACK_ENABLED: booleanEnv.default(false),
  FCC_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
});

export const env = envSchema.parse({
  WORKER_PORT: process.env.WORKER_PORT,
  NODE_ENV: process.env.NODE_ENV,
  API_BASE_URL: process.env.API_BASE_URL,
  WORKER_PRIVATE_KEY: process.env.WORKER_PRIVATE_KEY,
  WORKER_ENCRYPTION_PRIVATE_KEY: process.env.WORKER_ENCRYPTION_PRIVATE_KEY,
  WORKER_ENCRYPTION_KEY_ID: process.env.WORKER_ENCRYPTION_KEY_ID,
  CONFIDENTIAL_INPUT_MODE: process.env.CONFIDENTIAL_INPUT_MODE,
  PROOFVAULT_REGISTRY_ADDRESS: process.env.PROOFVAULT_REGISTRY_ADDRESS,
  CHAIN_ID: process.env.CHAIN_ID,
  MOCK_CONFIDENTIAL_COMPUTE: process.env.MOCK_CONFIDENTIAL_COMPUTE,
  FTSO_NETWORK: process.env.FTSO_NETWORK,
  FTSO_FALLBACK_ENABLED: process.env.FTSO_FALLBACK_ENABLED,
  COSTON2_RPC_URL: process.env.COSTON2_RPC_URL,
  FTSO_PRICE_TIMEOUT_MS: process.env.FTSO_PRICE_TIMEOUT_MS,
  FTSOV2_ADDRESS: process.env.FTSOV2_ADDRESS,
  FXRP_TOKEN_ADDRESS: process.env.FXRP_TOKEN_ADDRESS,
  FDC_VERIFIER_URL: process.env.FDC_VERIFIER_URL,
  FDC_DA_LAYER_URL: process.env.FDC_DA_LAYER_URL,
  FDC_API_KEY: process.env.FDC_API_KEY,
  FDC_CONTRACT_REGISTRY_ADDRESS: process.env.FDC_CONTRACT_REGISTRY_ADDRESS,
  FDC_POLL_INTERVAL_MS: process.env.FDC_POLL_INTERVAL_MS,
  FDC_MAX_WAIT_MS: process.env.FDC_MAX_WAIT_MS,
  FCC_MODE: process.env.FCC_MODE,
  FCC_EXTENSION_ENDPOINT: process.env.FCC_EXTENSION_ENDPOINT,
  FCC_EXTENSION_ID: process.env.FCC_EXTENSION_ID,
  FCC_FALLBACK_ENABLED: process.env.FCC_FALLBACK_ENABLED,
  FCC_TIMEOUT_MS: process.env.FCC_TIMEOUT_MS,
});
