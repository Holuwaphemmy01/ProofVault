import { sha256Hex } from "@proofvault/proof-payload";
import { FdcClient, type FdcClientOptions } from "./fdc-client.js";
import type {
  AddressValidityInput,
  AddressValidityResult,
  FdcSourceConfig,
} from "./fdc.types.js";

const sourceConfigs: Record<string, FdcSourceConfig> = {
  xrp: { sourceId: "testXRP", verifierPath: "xrp" },
  xrpl: { sourceId: "testXRP", verifierPath: "xrp" },
  testxrp: { sourceId: "testXRP", verifierPath: "xrp" },
  btc: { sourceId: "testBTC", verifierPath: "btc" },
  bitcoin: { sourceId: "testBTC", verifierPath: "btc" },
  doge: { sourceId: "testDOGE", verifierPath: "doge" },
  dogecoin: { sourceId: "testDOGE", verifierPath: "doge" },
};

export async function validateExternalAddress(
  input: AddressValidityInput,
  options: FdcClientOptions = {},
): Promise<AddressValidityResult & { addressHash: string }> {
  const chain = input.chain.trim().toLowerCase();
  const address = input.address.trim();
  const config = sourceConfigs[chain];

  if (!config) {
    throw new Error(`Unsupported FDC AddressValidity chain: ${input.chain}`);
  }

  if (!address || address.length < 20) {
    throw new Error("Malformed external reserve address");
  }

  const client = new FdcClient(options);
  const prepared = await client.prepareAddressValidityRequest(config, address);
  const submission = await client.submitAttestationRequest(prepared.abiEncodedRequest);

  await client.waitForRoundFinalization(submission.roundId);

  const rawProof = await client.retrieveProof(prepared.abiEncodedRequest, submission.roundId);
  const proof = client.decodeAddressValidityProof(rawProof);

  if (proof.data.requestBody.addressStr !== address) {
    throw new Error("FDC AddressValidity proof does not match requested address");
  }

  const verified = await client.verifyAddressValidityProof(proof);
  const valid = verified && proof.data.responseBody.isValid;

  if (!valid) {
    throw new Error("FDC AddressValidity proof verification failed");
  }

  return {
    attestationType: "AddressValidity",
    chain,
    valid,
    roundId: submission.roundId,
    requestTxHash: submission.requestTxHash,
    proofAvailable: true,
    verificationSource: "FDC",
    addressHash: sha256Hex(address),
  };
}

export function requiresFdcAddressValidity(chain: string) {
  return Boolean(sourceConfigs[chain.trim().toLowerCase()]);
}
