import { workerPrivateKey } from "./helpers.js";

process.env.WORKER_PRIVATE_KEY = workerPrivateKey;
process.env.PROOFVAULT_REGISTRY_ADDRESS = "0x0000000000000000000000000000000000000001";
process.env.CHAIN_ID = "31337";
process.env.API_BASE_URL = "";
