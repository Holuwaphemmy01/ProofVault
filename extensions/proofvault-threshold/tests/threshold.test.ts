import { describe, expect, it } from "vitest";
import { verifyReserveThreshold } from "../src/threshold.js";

const commitment = `0x${"11".repeat(32)}`;

describe("proofvault threshold extension", () => {
  it("returns PASS when private values exceed the threshold", () => {
    const result = verifyReserveThreshold({
      requestId: "1",
      requiredThreshold: "1000000",
      assetValues: ["500000", "350000", "250000"],
      commitment,
    });

    expect(result.thresholdMet).toBe(true);
    expect(result.outcome).toBe("PASS");
    expect(result.computeSource).toBe("FCC");
  });

  it("returns FAIL when private values are below the threshold", () => {
    const result = verifyReserveThreshold({
      requestId: "1",
      requiredThreshold: "1000000",
      assetValues: ["400000", "200000"],
      commitment,
    });

    expect(result.thresholdMet).toBe(false);
    expect(result.outcome).toBe("FAIL");
  });

  it("passes when private values equal the threshold", () => {
    const result = verifyReserveThreshold({
      requestId: "1",
      requiredThreshold: "1000000",
      assetValues: ["600000", "400000"],
      commitment,
    });

    expect(result.thresholdMet).toBe(true);
  });

  it("rejects empty asset values", () => {
    expect(() => verifyReserveThreshold({
      requestId: "1",
      requiredThreshold: "1000000",
      assetValues: [],
      commitment,
    })).toThrow("assetValues must not be empty");
  });

  it("rejects negative asset values", () => {
    expect(() => verifyReserveThreshold({
      requestId: "1",
      requiredThreshold: "1000000",
      assetValues: ["-1"],
      commitment,
    })).toThrow("non-negative integer");
  });

  it("does not expose private values or totals", () => {
    const result = verifyReserveThreshold({
      requestId: "1",
      requiredThreshold: "1000000",
      assetValues: ["500000", "350000", "250000"],
      commitment,
    });
    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain("assetValues");
    expect(serialized).not.toContain("totalReserve");
    expect(serialized).not.toContain("500000");
    expect(serialized).not.toContain("350000");
    expect(serialized).not.toContain("250000");
  });
});
