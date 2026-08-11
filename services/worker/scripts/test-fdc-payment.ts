import dotenv from "dotenv";
import { verifyPaymentAttestation } from "../src/integrations/fdc/payment-attestation.service.js";

dotenv.config();

const transactionId = process.argv[2] ?? process.env.FDC_PAYMENT_TRANSACTION_ID;
const expectedDestination = process.argv[3] ?? process.env.FDC_PAYMENT_EXPECTED_DESTINATION;
const expectedReference = process.argv[4] ?? process.env.FDC_PAYMENT_EXPECTED_REFERENCE;

if (!transactionId) {
  throw new Error("Provide an XRPL testnet transaction ID as an argument or FDC_PAYMENT_TRANSACTION_ID");
}

const result = await verifyPaymentAttestation({
  chain: "XRP",
  transactionId,
  expectedDestination,
  expectedReference,
});

console.log(JSON.stringify({
  attestationType: result.attestationType,
  chain: result.chain,
  verified: result.verified,
  transactionIdHash: result.transactionIdHash,
  requestTxHash: result.requestTxHash,
  roundId: result.roundId,
  verificationSource: result.verificationSource,
}, null, 2));
