import { describe, expect, it } from "vitest";
import { encryptedProofPayloadSchema } from "@proofvault/proof-payload";
import { makeEncryptedPayload } from "./helpers.js";

describe("encrypted proof payload schema", () => {
  it("accepts a valid encrypted payload", () => {
    const { encryptedProofPayload } = makeEncryptedPayload();

    expect(encryptedProofPayloadSchema.safeParse(encryptedProofPayload).success).toBe(true);
  });

  it("rejects a payload missing encryptedKey", () => {
    const { encryptedProofPayload } = makeEncryptedPayload();
    const { encryptedKey: _encryptedKey, ...invalidPayload } = encryptedProofPayload;

    expect(encryptedProofPayloadSchema.safeParse(invalidPayload).success).toBe(false);
  });

  it("rejects a wrong version", () => {
    const { encryptedProofPayload } = makeEncryptedPayload();

    expect(encryptedProofPayloadSchema.safeParse({
      ...encryptedProofPayload,
      version: "wrong-version",
    }).success).toBe(false);
  });
});
