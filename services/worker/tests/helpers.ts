import crypto from "node:crypto";
import {
  canonicalJson,
  encryptedProofPayloadAlgorithm,
  encryptedProofPayloadVersion,
  sha256Hex,
  type EncryptedProofPayload,
  type PrivateProofPayload,
} from "@proofvault/proof-payload";

export const workerPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
export const workerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

export function privatePayload(overrides: Partial<PrivateProofPayload> = {}): PrivateProofPayload {
  return {
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
      },
      {
        assetSymbol: "FLR",
        chain: "flare",
        walletAddress: "0x92A7F13C00000000000000000000000000000000",
        sourceLabel: "FLR Reserve Source 1",
      },
    ],
    privateSalt: "test-private-salt",
    createdAt: "2026-08-05T15:19:00.000Z",
    ...overrides,
  };
}

export function makeEncryptedPayload(payload = privatePayload()) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });
  const aesKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const aad = `${payload.projectSlug}:proof-request`;
  const cipher = crypto.createCipheriv("aes-256-gcm", aesKey, iv);

  cipher.setAAD(Buffer.from(aad));

  const ciphertext = Buffer.concat([
    cipher.update(canonicalJson(payload), "utf8"),
    cipher.final(),
  ]);
  const encryptedKey = crypto.publicEncrypt(
    {
      key: publicKey,
      oaepHash: "sha256",
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    aesKey,
  );
  const encryptedProofPayload: EncryptedProofPayload = {
    version: encryptedProofPayloadVersion,
    algorithm: encryptedProofPayloadAlgorithm,
    keyId: "proofvault-worker-local-v1",
    encryptedKey: encryptedKey.toString("base64"),
    iv: iv.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    aad,
    payloadHash: sha256Hex(canonicalJson(payload)),
    createdAt: "2026-08-05T15:20:00.000Z",
  };

  return {
    encryptedProofPayload,
    privateKey,
    publicKey,
  };
}
