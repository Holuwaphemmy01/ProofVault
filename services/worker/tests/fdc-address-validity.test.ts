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
  responseAddress?: string;
  responseIsValid?: boolean;
} = {}): FdcClientOptions {
  const responseHex = encodeAddressValidityResponse(
    overrides.responseAddress ?? xrplAddress,
    overrides.responseIsValid ?? true,
  );
  const fetchFn = vi.fn(async (url: string) => {
    if (url.includes("prepareRequest")) {
      return Response.json({ abiEncodedRequest: `0x${"ab".repeat(16)}` });
    }

    return Response.json(overrides.proofAvailable === false
      ? {}
      : {
          response_hex: responseHex,
          proof: [`0x${"34".repeat(32)}`],
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
          hash: `0x${"56".repeat(32)}`,
          wait: vi.fn(async () => ({
            blockNumber: 10,
            hash: `0x${"56".repeat(32)}`,
          })),
        })),
      },
      feeConfigurations: {
        getRequestFee: vi.fn(async () => 1n),
      },
      flareSystemsManager: {
        firstVotingRoundStartTs: vi.fn(async () => 1000n),
        votingEpochDurationSeconds: vi.fn(async () => 90n),
      },
      relay: {
        isFinalized: vi.fn(async () => true),
      },
      verification: {
        verifyAddressValidity: vi.fn(async () => overrides.verifyProof ?? true),
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
    expect(result.verificationSource).toBe("FDC");
    expect(result.proofAvailable).toBe(true);
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

  it("fails cleanly when the DA layer does not provide a proof", async () => {
    await expect(validateExternalAddress({
      chain: "xrpl",
      address: xrplAddress,
    }, mockedOptions({ proofAvailable: false }))).rejects.toThrow("proof was not available");
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
