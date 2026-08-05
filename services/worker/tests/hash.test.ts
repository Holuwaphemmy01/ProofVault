import { describe, expect, it } from "vitest";
import { canonicalJson, sha256Hex } from "@proofvault/proof-payload";

describe("hash helpers", () => {
  it("produces deterministic hashes for equivalent input", () => {
    const payload = { b: 2, a: { d: 4, c: 3 } };

    expect(sha256Hex(canonicalJson(payload))).toBe(sha256Hex(canonicalJson(payload)));
    expect(canonicalJson(payload)).toBe(canonicalJson({ a: { c: 3, d: 4 }, b: 2 }));
  });

  it("produces different hashes for different input", () => {
    expect(sha256Hex(canonicalJson({ value: "one" }))).not.toBe(
      sha256Hex(canonicalJson({ value: "two" })),
    );
  });
});
