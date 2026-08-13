import dotenv from "dotenv";
import { validateExternalAddress } from "../src/integrations/fdc/address-validity.service.js";

dotenv.config();

const address = process.argv[2] ?? process.env.FDC_TEST_XRP_ADDRESS;
const chain = process.argv[3] ?? process.env.FDC_TEST_CHAIN ?? "xrpl";

if (!address) {
  throw new Error("Provide an XRPL testnet address as an argument or FDC_TEST_XRP_ADDRESS");
}

const result = await validateExternalAddress({
  chain,
  address,
});

console.log(JSON.stringify({
  attestationType: result.attestationType,
  chain: result.chain,
  valid: result.valid,
  source: result.source,
  votingRoundId: result.votingRoundId,
  requestTxHash: result.requestTxHash,
  requestBlockNumber: result.requestBlockNumber,
  proofAvailable: result.proofAvailable,
  proofVerified: result.proofVerified,
  fdcHubAddress: result.fdcHubAddress,
  fdcHubAddressSource: result.fdcHubAddressSource,
  fdcVerificationAddress: result.fdcVerificationAddress,
  fdcVerificationAddressSource: result.fdcVerificationAddressSource,
  verifiedAt: result.verifiedAt,
  addressHash: result.addressHash,
}, null, 2));
