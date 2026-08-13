import { AbiCoder } from "ethers";
import { describe, expect, it, vi } from "vitest";
import {
  verifyPaymentAttestation,
} from "../src/integrations/fdc/payment-attestation.service.js";
import {
  toUtf8HexString,
  type FdcClientOptions,
} from "../src/integrations/fdc/fdc-client.js";

const paymentResponseType =
  "tuple(bytes32 attestationType,bytes32 sourceId,uint64 votingRound,uint64 lowestUsedTimestamp,tuple(bytes32 transactionId,uint256 inUtxo,uint256 utxo) requestBody,tuple(uint64 blockNumber,uint64 blockTimestamp,bytes32 sourceAddressHash,bytes32 sourceAddressesRoot,bytes32 receivingAddressHash,bytes32 intendedReceivingAddressHash,int256 spentAmount,int256 intendedSpentAmount,int256 receivedAmount,int256 intendedReceivedAmount,bytes32 standardPaymentReference,bool oneToOne,uint8 status) responseBody)";

const transactionId = `${"ab".repeat(32)}`;
const alternateTransactionId = `0x${"cd".repeat(32)}`;
const receivingAddressHash = `0x${"12".repeat(32)}`;
const standardPaymentReference = `0x${"34".repeat(32)}`;
const receivedAmount = 100000000n;

function encodePaymentResponse(input: {
  responseTransactionId?: string;
  status?: number;
  destinationHash?: string;
  paymentReference?: string;
  receivedAmount?: bigint;
} = {}) {
  return AbiCoder.defaultAbiCoder().encode([paymentResponseType], [[
    toUtf8HexString("Payment"),
    toUtf8HexString("testXRP"),
    1n,
    1785947000n,
    [input.responseTransactionId ?? `0x${transactionId}`, 0n, 0n],
    [
      4782114n,
      1739363462n,
      `0x${"56".repeat(32)}`,
      `0x${"78".repeat(32)}`,
      input.destinationHash ?? receivingAddressHash,
      input.destinationHash ?? receivingAddressHash,
      100000012n,
      100000012n,
      input.receivedAmount ?? receivedAmount,
      input.receivedAmount ?? receivedAmount,
      input.paymentReference ?? standardPaymentReference,
      true,
      input.status ?? 0,
    ],
  ]]);
}

function mockedOptions(overrides: {
  verifyProof?: boolean;
  proofAvailable?: boolean;
  verifierStatus?: number;
  verifierBody?: unknown;
  assertPrepareRequest?: (body: Record<string, unknown>) => void;
  daBody?: unknown;
  fdcHubFails?: boolean;
  feeFails?: boolean;
  finalized?: boolean;
  responseTransactionId?: string;
  status?: number;
  destinationHash?: string;
  paymentReference?: string;
  receivedAmount?: bigint;
} = {}): FdcClientOptions {
  const responseHex = encodePaymentResponse(overrides);
  const fetchFn = vi.fn(async (url: string, init?: RequestInit) => {
    if (url.includes("prepareRequest")) {
      if (overrides.assertPrepareRequest) {
        overrides.assertPrepareRequest(JSON.parse(init?.body as string) as Record<string, unknown>);
      }

      return Response.json(
        overrides.verifierBody ?? { abiEncodedRequest: `0x${"ab".repeat(16)}`, status: "VALID" },
        { status: overrides.verifierStatus ?? 200 },
      );
    }

    return Response.json(overrides.daBody ?? (overrides.proofAvailable === false
      ? {}
      : {
          response_hex: responseHex,
          proof: [`0x${"90".repeat(32)}`],
        }));
  }) as unknown as typeof fetch;

  return {
    fetchFn,
    provider: {
      getBlock: vi.fn(async () => ({ timestamp: 1090 })),
    },
    contracts: {
      fdcHub: {
        requestAttestation: vi.fn(async () => {
          if (overrides.fdcHubFails) {
            throw new Error("FdcHub rejected request");
          }

          return {
          hash: `0x${"aa".repeat(32)}`,
          wait: vi.fn(async () => ({
            blockNumber: 10,
            hash: `0x${"aa".repeat(32)}`,
          })),
          };
        }),
      },
      feeConfigurations: {
        getRequestFee: vi.fn(async () => {
          if (overrides.feeFails) {
            throw new Error("fee unavailable");
          }

          return 1n;
        }),
      },
      flareSystemsManager: {
        getCurrentVotingEpochId: vi.fn(async () => 1),
        firstVotingRoundStartTs: vi.fn(async () => 1000n),
        votingEpochDurationSeconds: vi.fn(async () => 90n),
      },
      relay: {
        isFinalized: vi.fn(async () => overrides.finalized ?? true),
      },
      verification: {
        fdcProtocolId: vi.fn(async () => 200),
        verifyAddressValidity: vi.fn(async () => true),
        verifyPayment: vi.fn(async () => overrides.verifyProof ?? true),
      },
    },
    pollIntervalMs: 1,
    maxWaitMs: 10,
  };
}

describe("FDC Payment attestation", () => {
  it("verifies a valid XRPL payment proof and returns only safe audit fields", async () => {
    let prepareBody: Record<string, unknown> | undefined;
    const result = await verifyPaymentAttestation({
      chain: "XRP",
      transactionId: `0x${transactionId}`,
      expectedDestination: receivingAddressHash,
      expectedReference: standardPaymentReference,
    }, mockedOptions({
      assertPrepareRequest: (body) => {
        prepareBody = body;
      },
    }));
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      attestationType: "Payment",
      chain: "XRP",
      verified: true,
      source: "FDC",
      verificationSource: "FDC",
      proofAvailable: true,
      proofVerified: true,
      votingRoundId: 1,
      requestBlockNumber: 10,
      fdcHubAddressSource: "injected",
      fdcVerificationAddressSource: "injected",
    });
    expect(result.transactionIdHash).toMatch(/^0x/);
    expect((prepareBody?.requestBody as Record<string, unknown>).transactionId).toBe(transactionId);
    expect((prepareBody?.requestBody as Record<string, unknown>).inUtxo).toBe("0");
    expect((prepareBody?.requestBody as Record<string, unknown>).utxo).toBe("0");
    expect(serialized).not.toContain(transactionId);
    expect(serialized).not.toContain("receivedAmount");
    expect(serialized).not.toContain("spentAmount");
  });

  it("validates an expected received amount when provided", async () => {
    const result = await verifyPaymentAttestation({
      chain: "XRP",
      transactionId,
      expectedAmount: receivedAmount.toString(),
    }, mockedOptions());

    expect(result.verified).toBe(true);
  });

  it("rejects when the returned proof transaction ID is different", async () => {
    await expect(verifyPaymentAttestation({
      chain: "XRP",
      transactionId,
    }, mockedOptions({
      responseTransactionId: alternateTransactionId,
    }))).rejects.toThrow("does not match requested transaction");
  });

  it("rejects when proof verification is false", async () => {
    await expect(verifyPaymentAttestation({
      chain: "XRP",
      transactionId,
    }, mockedOptions({
      verifyProof: false,
    }))).rejects.toThrow("proof verification failed");
  });

  it("rejects when the verifier prepare request fails", async () => {
    await expect(verifyPaymentAttestation({
      chain: "XRP",
      transactionId,
    }, mockedOptions({ verifierStatus: 500, verifierBody: { message: "transaction not found" } }))).rejects.toThrow("rejected Payment request: transaction not found");
  });

  it("rejects when the verifier returns malformed request data", async () => {
    await expect(verifyPaymentAttestation({
      chain: "XRP",
      transactionId,
    }, mockedOptions({ verifierBody: { abiEncodedRequest: "not-hex", message: "bad request" } }))).rejects.toThrow("response missing abiEncodedRequest");
  });

  it("rejects when the verifier marks the prepared request invalid", async () => {
    await expect(verifyPaymentAttestation({
      chain: "XRP",
      transactionId,
    }, mockedOptions({ verifierBody: { abiEncodedRequest: `0x${"ab".repeat(16)}`, status: "INVALID" } }))).rejects.toThrow("invalid request status");
  });

  it("fails cleanly when FDC request fee retrieval fails", async () => {
    await expect(verifyPaymentAttestation({
      chain: "XRP",
      transactionId,
    }, mockedOptions({ feeFails: true }))).rejects.toThrow("fee retrieval failed");
  });

  it("fails cleanly when FdcHub submission fails", async () => {
    await expect(verifyPaymentAttestation({
      chain: "XRP",
      transactionId,
    }, mockedOptions({ fdcHubFails: true }))).rejects.toThrow("FdcHub rejected request");
  });

  it("fails cleanly when the FDC round is not finalized", async () => {
    await expect(verifyPaymentAttestation({
      chain: "XRP",
      transactionId,
    }, mockedOptions({ finalized: false }))).rejects.toThrow("was not finalized before timeout");
  });

  it("rejects when expected destination does not match", async () => {
    await expect(verifyPaymentAttestation({
      chain: "XRP",
      transactionId,
      expectedDestination: `0x${"ff".repeat(32)}`,
    }, mockedOptions())).rejects.toThrow("destination did not match");
  });

  it("rejects when expected amount does not match", async () => {
    await expect(verifyPaymentAttestation({
      chain: "XRP",
      transactionId,
      expectedAmount: "999",
    }, mockedOptions())).rejects.toThrow("amount did not match");
  });

  it("fails cleanly when the DA layer does not provide a proof", async () => {
    await expect(verifyPaymentAttestation({
      chain: "XRP",
      transactionId,
    }, mockedOptions({
      proofAvailable: false,
    }))).rejects.toThrow("proof was not available");
  });

  it("rejects malformed DA proof responses", async () => {
    await expect(verifyPaymentAttestation({
      chain: "XRP",
      transactionId,
    }, mockedOptions({ daBody: { response_hex: "not-hex", proof: [] } }))).rejects.toThrow("malformed Payment response");
  });
});
