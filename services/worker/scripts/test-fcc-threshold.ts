import dotenv from "dotenv";
import { verifyReserveThreshold } from "../src/integrations/fcc/fcc-threshold.service.js";

dotenv.config();

const result = await verifyReserveThreshold({
  requestId: process.env.FCC_TEST_REQUEST_ID ?? "proofvault-demo-request",
  requiredThreshold: Number(process.env.FCC_TEST_THRESHOLD ?? 200000),
  assetValues: [
    Number(process.env.FCC_TEST_ASSET_VALUE_1 ?? 120000),
    Number(process.env.FCC_TEST_ASSET_VALUE_2 ?? 100000),
  ],
  commitment: process.env.FCC_TEST_COMMITMENT ?? `0x${"11".repeat(32)}`,
});

console.log(JSON.stringify({
  outcome: result.outcome,
  thresholdMet: result.thresholdMet,
  outputCommitment: result.outputCommitment,
  executionReference: result.executionReference,
  extensionId: result.extensionId,
  computeSource: result.computeSource,
}, null, 2));
