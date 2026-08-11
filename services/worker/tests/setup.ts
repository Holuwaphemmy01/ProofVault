import { workerPrivateKey } from "./helpers.js";

process.env.WORKER_PRIVATE_KEY = workerPrivateKey;
process.env.PROOFVAULT_REGISTRY_ADDRESS = "0x0000000000000000000000000000000000000001";
process.env.CHAIN_ID = "31337";
process.env.API_BASE_URL = "";
process.env.FTSO_FALLBACK_ENABLED = "true";
process.env.FTSO_NETWORK = "coston2";
process.env.FTSO_PRICE_TIMEOUT_MS = "10000";
process.env.FDC_VERIFIER_URL = "https://fdc.example/";
process.env.FDC_DA_LAYER_URL = "https://da.example/";
process.env.FDC_POLL_INTERVAL_MS = "1";
process.env.FDC_MAX_WAIT_MS = "20";
