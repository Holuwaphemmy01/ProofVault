import { sha256Hex } from "@proofvault/proof-payload";
import { keccak256, toUtf8Bytes } from "ethers";
import { FdcClient, type FdcClientOptions } from "./fdc-client.js";
import type {
  PaymentAttestationInput,
  PaymentAttestationResult,
} from "./fdc.types.js";

const sourceConfig = {
  XRP: {
    sourceId: "testXRP" as const,
    verifierPath: "xrp",
  },
};

export async function verifyPaymentAttestation(
  input: PaymentAttestationInput,
  options: FdcClientOptions = {},
): Promise<PaymentAttestationResult> {
  const transactionId = normalizeTransactionId(input.transactionId);
  const config = sourceConfig[input.chain];

  if (!config) {
    throw new Error(`Unsupported FDC Payment chain: ${input.chain}`);
  }

  const client = new FdcClient(options);
  const prepared = await client.preparePaymentRequest({
    verifierPath: config.verifierPath,
    sourceId: config.sourceId,
    transactionId,
  });
  const submission = await client.submitAttestationRequest(prepared.abiEncodedRequest);

  await client.waitForRoundFinalization(submission.roundId);

  const rawProof = await client.retrieveProof(prepared.abiEncodedRequest, submission.roundId);
  const proof = client.decodePaymentProof(rawProof);

  if (proof.data.requestBody.transactionId.toLowerCase() !== `0x${transactionId}`.toLowerCase()) {
    throw new Error("FDC Payment proof does not match requested transaction");
  }

  const proofVerified = await client.verifyPaymentProof(proof);
  const verificationMetadata = await client.getFdcVerificationMetadata();

  if (!proofVerified) {
    throw new Error("FDC Payment proof verification failed");
  }

  if (proof.data.responseBody.status !== 0) {
    throw new Error("FDC Payment transaction was not successful");
  }

  if (
    input.expectedDestination
    && proof.data.responseBody.receivingAddressHash.toLowerCase() !== normalizeExpectedHash(input.expectedDestination)
  ) {
    throw new Error("FDC Payment destination did not match expectation");
  }

  if (
    input.expectedReference
    && proof.data.responseBody.standardPaymentReference.toLowerCase() !== normalizeExpectedHash(input.expectedReference)
  ) {
    throw new Error("FDC Payment reference did not match expectation");
  }

  if (
    input.expectedAmount
    && proof.data.responseBody.receivedAmount !== normalizeExpectedAmount(input.expectedAmount)
  ) {
    throw new Error("FDC Payment amount did not match expectation");
  }

  return {
    attestationType: "Payment",
    chain: input.chain,
    verified: true,
    transactionIdHash: sha256Hex(transactionId.toLowerCase()),
    requestTxHash: submission.requestTxHash,
    requestBlockNumber: submission.requestBlockNumber,
    roundId: submission.roundId,
    votingRoundId: submission.roundId,
    proofAvailable: true,
    proofVerified: true,
    source: "FDC",
    verificationSource: "FDC",
    fdcHubAddress: submission.fdcHubAddress,
    fdcHubAddressSource: submission.fdcHubAddressSource,
    fdcVerificationAddress: verificationMetadata.address,
    fdcVerificationAddressSource: verificationMetadata.source,
    verifiedAt: new Date().toISOString(),
  };
}

export function hasPaymentEvidence(value: unknown): value is PaymentAttestationInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const evidence = value as Partial<PaymentAttestationInput>;
  return evidence.chain === "XRP" && typeof evidence.transactionId === "string" && evidence.transactionId.length > 0;
}

function normalizeTransactionId(transactionId: string) {
  const normalized = transactionId.trim();

  if (/^[0-9a-fA-F]{64}$/.test(normalized)) {
    return normalized;
  }

  if (/^0x[0-9a-fA-F]{64}$/.test(normalized)) {
    return normalized.slice(2);
  }

  throw new Error("Malformed FDC Payment transaction ID");
}

function normalizeExpectedHash(value: string) {
  const normalized = value.trim();

  if (/^0x[0-9a-fA-F]{64}$/.test(normalized)) {
    return normalized.toLowerCase();
  }

  return keccak256(toUtf8Bytes(normalized)).toLowerCase();
}

function normalizeExpectedAmount(value: string) {
  const normalized = value.trim();

  if (!/^\d+$/.test(normalized)) {
    throw new Error("Malformed FDC Payment expected amount");
  }

  return BigInt(normalized);
}
