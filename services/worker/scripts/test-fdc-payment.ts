import dotenv from "dotenv";
import { verifyPaymentAttestation } from "../src/integrations/fdc/payment-attestation.service.js";

dotenv.config();

const transactionId = process.argv[2] ?? process.env.FDC_TEST_XRP_PAYMENT_TX_ID;
const expectedDestination = process.argv[3] ?? process.env.FDC_TEST_XRP_EXPECTED_DESTINATION;
const expectedAmount = process.argv[4] ?? process.env.FDC_TEST_XRP_EXPECTED_AMOUNT;

if (!transactionId) {
  throw new Error("Provide an XRPL testnet transaction ID as an argument or FDC_TEST_XRP_PAYMENT_TX_ID");
}

const result = await verifyPaymentAttestation({
  chain: "XRP",
  transactionId,
  expectedDestination,
  expectedAmount,
});

console.log(JSON.stringify({
  attestationType: result.attestationType,
  chain: result.chain,
  verified: result.verified,
  source: result.source,
  requestTxHash: result.requestTxHash,
  votingRoundId: result.votingRoundId,
  requestBlockNumber: result.requestBlockNumber,
  fdcHubAddress: result.fdcHubAddress,
  fdcVerificationAddress: result.fdcVerificationAddress,
  proofAvailable: result.proofAvailable,
  proofVerified: result.proofVerified,
  verifiedAt: result.verifiedAt,
}, null, 2));
