import { AbiCoder } from "ethers";
import { describe, expect, it, vi } from "vitest";
import {
  validateExternalAddress,
} from "../src/integrations/fdc/address-validity.service.js";
import {
  toUtf8HexString,
  type FdcClientOptions,
} from "../src/integrations/fdc/fdc-client.js";

const addressValidityResponseType =
  "tuple(bytes32 attestationType,bytes32 sourceId,uint64 votingRound,uint64 lowestUsedTimestamp,tuple(string addressStr) requestBody,tuple(bool isValid,string standardAddress,bytes32 standardAddressHash) responseBody)";

const xrplAddress = "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh";

function encodeAddressValidityResponse(address: string, isValid = true) {
  return AbiCoder.defaultAbiCoder().encode([addressValidityResponseType], [[
    toUtf8HexString("AddressValidity"),
    toUtf8HexString("testXRP"),
    1n,
    1785947000n,
    [address],
    [isValid, address, `0x${"12".repeat(32)}`],
  ]]);
}

function mockedOptions(overrides: {
  verifyProof?: boolean;
  proofAvailable?: boolean;
  verifierStatus?: number;
  verifierBody?: unknown;
  daBody?: unknown;
  fdcHubFails?: boolean;
  feeFails?: boolean;
  finalized?: boolean;
  responseAddress?: string;
  responseIsValid?: boolean;
} = {}): FdcClientOptions {
  const responseHex = encodeAddressValidityResponse(
    overrides.responseAddress ?? xrplAddress,
    overrides.responseIsValid ?? true,
  );
  const fetchFn = vi.fn(async (url: string) => {
    if (url.includes("prepareRequest")) {
      return Response.json(
        overrides.verifierBody ?? { abiEncodedRequest: `0x${"ab".repeat(16)}`, status: "VALID" },
        { status: overrides.verifierStatus ?? 200 },
      );
    }

    return Response.json(overrides.daBody ?? (overrides.proofAvailable === false
      ? {}
      : {
          response_hex: responseHex,
          proof: [`0x${"34".repeat(32)}`],
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
          hash: `0x${"56".repeat(32)}`,
          wait: vi.fn(async () => ({
            blockNumber: 10,
            hash: `0x${"56".repeat(32)}`,
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
        verifyAddressValidity: vi.fn(async () => overrides.verifyProof ?? true),
        verifyPayment: vi.fn(async () => true),
      },
    },
    pollIntervalMs: 1,
    maxWaitMs: 10,
  };
}

describe("FDC AddressValidity integration", () => {
  it("validates an XRPL testnet address when the FDC proof verifies", async () => {
    const result = await validateExternalAddress({
      chain: "xrpl",
      address: xrplAddress,
    }, mockedOptions());

    const serialized = JSON.stringify(result);

    expect(result.valid).toBe(true);
    expect(result.attestationType).toBe("AddressValidity");
    expect(result.chain).toBe("XRP");
    expect(result.source).toBe("FDC");
    expect(result.verificationSource).toBe("FDC");
    expect(result.proofAvailable).toBe(true);
    expect(result.proofVerified).toBe(true);
    expect(result.votingRoundId).toBe(1);
    expect(result.fdcHubAddressSource).toBe("injected");
    expect(result.fdcVerificationAddressSource).toBe("injected");
    expect(result.requestTxHash).toMatch(/^0x/);
    expect(serialized).not.toContain(xrplAddress);
  });

  it("rejects malformed addresses before submitting an attestation", async () => {
    await expect(validateExternalAddress({
      chain: "xrpl",
      address: "bad",
    }, mockedOptions())).rejects.toThrow("Malformed external reserve address");
  });

  it("rejects when FDC proof verification returns false", async () => {
    await expect(validateExternalAddress({
      chain: "xrpl",
      address: xrplAddress,
    }, mockedOptions({ verifyProof: false }))).rejects.toThrow("proof verification failed");
  });

  it("rejects when the verifier prepare request fails", async () => {
    await expect(validateExternalAddress({
      chain: "xrpl",
      address: xrplAddress,
    }, mockedOptions({ verifierStatus: 500, verifierBody: { message: "verifier unavailable" } }))).rejects.toThrow("rejected AddressValidity request: verifier unavailable");
  });

  it("rejects when the verifier returns malformed request data", async () => {
    await expect(validateExternalAddress({
      chain: "xrpl",
      address: xrplAddress,
    }, mockedOptions({ verifierBody: { abiEncodedRequest: "not-hex" } }))).rejects.toThrow("response missing abiEncodedRequest");
  });

  it("rejects when the verifier marks the prepared request invalid", async () => {
    await expect(validateExternalAddress({
      chain: "xrpl",
      address: xrplAddress,
    }, mockedOptions({ verifierBody: { abiEncodedRequest: `0x${"ab".repeat(16)}`, status: "INVALID" } }))).rejects.toThrow("invalid request status");
  });

  it("fails cleanly when FDC request fee retrieval fails", async () => {
    await expect(validateExternalAddress({
      chain: "xrpl",
      address: xrplAddress,
    }, mockedOptions({ feeFails: true }))).rejects.toThrow("fee retrieval failed");
  });

  it("fails cleanly when FdcHub submission fails", async () => {
    await expect(validateExternalAddress({
      chain: "xrpl",
      address: xrplAddress,
    }, mockedOptions({ fdcHubFails: true }))).rejects.toThrow("FdcHub rejected request");
  });

  it("fails cleanly when the FDC round is not finalized", async () => {
    await expect(validateExternalAddress({
      chain: "xrpl",
      address: xrplAddress,
    }, mockedOptions({ finalized: false }))).rejects.toThrow("was not finalized before timeout");
  });

  it("fails cleanly when the DA layer does not provide a proof", async () => {
    await expect(validateExternalAddress({
      chain: "xrpl",
      address: xrplAddress,
    }, mockedOptions({ proofAvailable: false }))).rejects.toThrow("proof was not available");
  });

  it("rejects malformed DA proof responses", async () => {
    await expect(validateExternalAddress({
      chain: "xrpl",
      address: xrplAddress,
    }, mockedOptions({ daBody: { response_hex: "not-hex", proof: [] } }))).rejects.toThrow("malformed AddressValidity response");
  });

  it("rejects when the proof response address does not match the request", async () => {
    await expect(validateExternalAddress({
      chain: "xrpl",
      address: xrplAddress,
    }, mockedOptions({
      responseAddress: "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",
    }))).rejects.toThrow("does not match requested address");
  });
});
