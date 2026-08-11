import dotenv from "dotenv";
import { validateExternalAddress } from "../src/integrations/fdc/address-validity.service.js";

dotenv.config();

const address = process.argv[2] ?? process.env.FDC_TEST_ADDRESS;
const chain = process.argv[3] ?? process.env.FDC_TEST_CHAIN ?? "xrpl";

if (!address) {
  throw new Error("Provide an XRPL testnet address as an argument or FDC_TEST_ADDRESS");
}

const result = await validateExternalAddress({
  chain,
  address,
});

console.log(JSON.stringify({
  attestationType: result.attestationType,
  chain: result.chain,
  valid: result.valid,
  roundId: result.roundId,
  requestTxHash: result.requestTxHash,
  proofAvailable: result.proofAvailable,
  verificationSource: result.verificationSource,
  addressHash: result.addressHash,
}, null, 2));
