import crypto from "node:crypto";
import {
  canonicalJson,
  encryptedProofPayloadAlgorithm,
  encryptedProofPayloadVersion,
  sha256Hex,
} from "@proofvault/proof-payload";

const publicKey = process.env.WORKER_ENCRYPTION_PUBLIC_KEY?.replace(/\\n/g, "\n");

if (!publicKey) {
  throw new Error("WORKER_ENCRYPTION_PUBLIC_KEY is required");
}

const privatePayload = {
  projectSlug: "atlasx-exchange",
  proofName: "July 2026 Reserve Verification",
  requiredThreshold: 1000000,
  thresholdCurrency: "USD",
  selectedAssets: ["BTC", "FLR"],
  wallets: [
    {
      assetSymbol: "BTC",
      chain: "bitcoin",
      walletAddress: "bc1q-private-demo-wallet-address",
      sourceLabel: "BTC Reserve Source 1",
      privateMetadata: {
        ownershipProof: "mock-signed-message",
      },
    },
    {
      assetSymbol: "FLR",
      chain: "flare",
      walletAddress: "0x92A7F13C00000000000000000000000000000000",
      sourceLabel: "FLR Reserve Source 1",
    },
  ],
  privateSalt: crypto.randomBytes(16).toString("hex"),
  createdAt: new Date().toISOString(),
};
const aesKey = crypto.randomBytes(32);
const iv = crypto.randomBytes(12);
const aad = `${privatePayload.projectSlug}:proof-request`;
const cipher = crypto.createCipheriv("aes-256-gcm", aesKey, iv);

cipher.setAAD(Buffer.from(aad));

const ciphertext = Buffer.concat([
  cipher.update(canonicalJson(privatePayload), "utf8"),
  cipher.final(),
]);
const authTag = cipher.getAuthTag();
const encryptedKey = crypto.publicEncrypt(
  {
    key: publicKey,
    oaepHash: "sha256",
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
  },
  aesKey,
);
const encryptedProofPayload = {
  version: encryptedProofPayloadVersion,
  algorithm: encryptedProofPayloadAlgorithm,
  keyId: process.env.WORKER_ENCRYPTION_KEY_ID ?? "proofvault-worker-local-v1",
  encryptedKey: encryptedKey.toString("base64"),
  iv: iv.toString("base64"),
  ciphertext: ciphertext.toString("base64"),
  authTag: authTag.toString("base64"),
  aad,
  payloadHash: sha256Hex(canonicalJson(privatePayload)),
  createdAt: new Date().toISOString(),
};

console.log(JSON.stringify({
  projectSlug: privatePayload.projectSlug,
  proofName: privatePayload.proofName,
  selectedAssets: privatePayload.selectedAssets,
  privacyMode: "confidential_threshold_proof",
  encryptedProofPayload,
  walletReferenceSummaries: privatePayload.wallets.map((wallet) => ({
    assetSymbol: wallet.assetSymbol,
    chain: wallet.chain,
    sourceLabel: wallet.sourceLabel,
    walletAddressHash: sha256Hex(wallet.walletAddress),
    maskedWalletAddress: wallet.walletAddress.startsWith("0x")
      ? `${wallet.walletAddress.slice(0, 6)}...${wallet.walletAddress.slice(-4)}`
      : `${wallet.walletAddress.slice(0, 6)}...${wallet.walletAddress.slice(-4)}`,
    encryptionVersion: encryptedProofPayloadVersion,
  })),
}, null, 2));
