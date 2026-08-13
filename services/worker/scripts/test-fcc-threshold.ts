import dotenv from "dotenv";
import { verifyReserveThreshold } from "../src/integrations/fcc/fcc-threshold.service.js";

dotenv.config();

const result = await verifyReserveThreshold({
  requestId: process.env.FCC_TEST_REQUEST_ID ?? "proofvault-demo-request",
  requiredThreshold: "1000000",
  assetValues: [
    "650000",
    "420000",
  ],
  commitment: process.env.FCC_TEST_COMMITMENT ?? `0x${"11".repeat(32)}`,
});

console.log(JSON.stringify({
  mode: process.env.FCC_MODE ?? "live",
  source: result.computeSource === "fcc" ? "FCC" : "LOCAL_FALLBACK_COMPUTE",
  outcome: result.outcome,
  thresholdMet: result.thresholdMet,
  outputCommitment: result.outputCommitment,
  executionReference: result.executionReference,
  extensionId: result.extensionId,
  fallbackUsed: result.computeSource !== "fcc",
}, null, 2));
