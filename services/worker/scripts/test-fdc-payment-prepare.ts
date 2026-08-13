import dotenv from "dotenv";
import { FdcClient } from "../src/integrations/fdc/fdc-client.js";

dotenv.config();

const transactionId = normalizeTransactionId(process.argv[2] ?? process.env.FDC_TEST_XRP_PAYMENT_TX_ID ?? "");

if (!transactionId) {
  throw new Error("Provide an XRPL testnet transaction ID as an argument or FDC_TEST_XRP_PAYMENT_TX_ID");
}

const client = new FdcClient();
const result = await client.inspectPaymentPrepareRequest({
  verifierPath: "xrp",
  sourceId: "testXRP",
  transactionId,
});

console.log(JSON.stringify({
  attestationType: result.attestationType,
  sourceId: result.sourceId,
  requestBodyFields: result.requestBodyFields,
  transactionIdFormat: "64-hex-no-0x",
  verifierHttpStatus: result.verifierHttpStatus,
  verifierContentType: result.verifierContentType,
  verifierAccepted: result.verifierAccepted,
  abiEncodedRequestPresent: result.abiEncodedRequestPresent,
  abiEncodedRequestPreview: result.abiEncodedRequestPreview,
  responseKeys: result.responseKeys,
  verifierMessage: result.verifierMessage,
}, null, 2));

function normalizeTransactionId(value: string) {
  const normalized = value.trim();

  if (/^[0-9a-fA-F]{64}$/.test(normalized)) {
    return normalized;
  }

  if (/^0x[0-9a-fA-F]{64}$/.test(normalized)) {
    return normalized.slice(2);
  }

  return "";
}
