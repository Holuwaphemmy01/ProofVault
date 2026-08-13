import { sha256Hex } from "@proofvault/proof-payload";
import { FdcClient, type FdcClientOptions } from "./fdc-client.js";
import type {
  AddressValidityInput,
  AddressValidityResult,
  FdcSourceConfig,
} from "./fdc.types.js";

const sourceConfigs: Record<string, FdcSourceConfig> = {
  xrp: { sourceId: "testXRP", verifierPath: "xrp", canonicalChain: "XRP" },
  xrpl: { sourceId: "testXRP", verifierPath: "xrp", canonicalChain: "XRP" },
  testxrp: { sourceId: "testXRP", verifierPath: "xrp", canonicalChain: "XRP" },
  btc: { sourceId: "testBTC", verifierPath: "btc_testnet4", canonicalChain: "BTC" },
  bitcoin: { sourceId: "testBTC", verifierPath: "btc_testnet4", canonicalChain: "BTC" },
  doge: { sourceId: "testDOGE", verifierPath: "doge", canonicalChain: "DOGE" },
  dogecoin: { sourceId: "testDOGE", verifierPath: "doge", canonicalChain: "DOGE" },
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
  const verificationMetadata = await client.getFdcVerificationMetadata();
  const valid = verified && proof.data.responseBody.isValid;

  if (!valid) {
    throw new Error("FDC AddressValidity proof verification failed");
  }

  return {
    attestationType: "AddressValidity",
    chain: config.canonicalChain,
    valid,
    source: "FDC",
    roundId: submission.roundId,
    votingRoundId: submission.roundId,
    requestTxHash: submission.requestTxHash,
    requestBlockNumber: submission.requestBlockNumber,
    proofAvailable: true,
    proofVerified: true,
    verificationSource: "FDC",
    fdcHubAddress: submission.fdcHubAddress,
    fdcHubAddressSource: submission.fdcHubAddressSource,
    fdcVerificationAddress: verificationMetadata.address,
    fdcVerificationAddressSource: verificationMetadata.source,
    verifiedAt: new Date().toISOString(),
    addressHash: sha256Hex(address),
  };
}

export function requiresFdcAddressValidity(chain: string) {
  return Boolean(sourceConfigs[chain.trim().toLowerCase()]);
}
