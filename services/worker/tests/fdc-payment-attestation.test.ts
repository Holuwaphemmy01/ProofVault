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

const transactionId = `0x${"ab".repeat(32)}`;
const alternateTransactionId = `0x${"cd".repeat(32)}`;
const receivingAddressHash = `0x${"12".repeat(32)}`;
const standardPaymentReference = `0x${"34".repeat(32)}`;

function encodePaymentResponse(input: {
  responseTransactionId?: string;
  status?: number;
  destinationHash?: string;
  paymentReference?: string;
} = {}) {
  return AbiCoder.defaultAbiCoder().encode([paymentResponseType], [[
    toUtf8HexString("Payment"),
    toUtf8HexString("testXRP"),
    1n,
    1785947000n,
    [input.responseTransactionId ?? transactionId, 0n, 0n],
    [
      4782114n,
      1739363462n,
      `0x${"56".repeat(32)}`,
      `0x${"78".repeat(32)}`,
      input.destinationHash ?? receivingAddressHash,
      input.destinationHash ?? receivingAddressHash,
      100000012n,
      100000012n,
      100000000n,
      100000000n,
      input.paymentReference ?? standardPaymentReference,
      true,
      input.status ?? 0,
    ],
  ]]);
}

function mockedOptions(overrides: {
  verifyProof?: boolean;
  proofAvailable?: boolean;
  responseTransactionId?: string;
  status?: number;
  destinationHash?: string;
  paymentReference?: string;
} = {}): FdcClientOptions {
  const responseHex = encodePaymentResponse(overrides);
  const fetchFn = vi.fn(async (url: string) => {
    if (url.includes("prepareRequest")) {
      return Response.json({ abiEncodedRequest: `0x${"ab".repeat(16)}` });
    }

    return Response.json(overrides.proofAvailable === false
      ? {}
      : {
          response_hex: responseHex,
          proof: [`0x${"90".repeat(32)}`],
        });
  }) as unknown as typeof fetch;

  return {
    fetchFn,
    provider: {
      getBlock: vi.fn(async () => ({ timestamp: 1090 })),
    },
    contracts: {
      fdcHub: {
        requestAttestation: vi.fn(async () => ({
          hash: `0x${"aa".repeat(32)}`,
          wait: vi.fn(async () => ({
            blockNumber: 10,
            hash: `0x${"aa".repeat(32)}`,
          })),
        })),
      },
      feeConfigurations: {
        getRequestFee: vi.fn(async () => 1n),
      },
      flareSystemsManager: {
        getCurrentVotingEpochId: vi.fn(async () => 1),
        firstVotingRoundStartTs: vi.fn(async () => 1000n),
        votingEpochDurationSeconds: vi.fn(async () => 90n),
      },
      relay: {
        isFinalized: vi.fn(async () => true),
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
    const result = await verifyPaymentAttestation({
      chain: "XRP",
      transactionId,
      expectedDestination: receivingAddressHash,
      expectedReference: standardPaymentReference,
    }, mockedOptions());
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      attestationType: "Payment",
      chain: "XRP",
      verified: true,
      verificationSource: "FDC",
    });
    expect(result.transactionIdHash).toMatch(/^0x/);
    expect(serialized).not.toContain(transactionId);
    expect(serialized).not.toContain("receivedAmount");
    expect(serialized).not.toContain("spentAmount");
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

  it("rejects when expected destination does not match", async () => {
    await expect(verifyPaymentAttestation({
      chain: "XRP",
      transactionId,
      expectedDestination: `0x${"ff".repeat(32)}`,
    }, mockedOptions())).rejects.toThrow("destination did not match");
  });

  it("fails cleanly when the DA layer does not provide a proof", async () => {
    await expect(verifyPaymentAttestation({
      chain: "XRP",
      transactionId,
    }, mockedOptions({
      proofAvailable: false,
    }))).rejects.toThrow("proof was not available");
  });
});
