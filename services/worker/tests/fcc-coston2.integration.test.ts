import { describe, expect, it } from "vitest";
import { verifyReserveThreshold } from "../src/integrations/fcc/fcc-threshold.service.js";

const describeLive = process.env.RUN_COSTON2_FCC_INTEGRATION_TESTS === "true"
  ? describe
  : describe.skip;

describeLive("FCC Coston2 live integration", () => {
  it("executes the ProofVault threshold extension without fallback", async () => {
    const result = await verifyReserveThreshold({
      requestId: "proofvault-coston2-integration",
      requiredThreshold: "1000000",
      assetValues: ["650000", "420000"],
      commitment: `0x${"11".repeat(32)}`,
      mode: "live",
      fallbackEnabled: false,
    });
    const serialized = JSON.stringify(result);

    expect(result.computeSource).toBe("fcc");
    expect(result.thresholdMet).toBe(true);
    expect(result.outcome).toBe("PASS");
    expect(result.outputCommitment).toMatch(/^0x[0-9a-fA-F]{64}$/);
    expect(serialized).not.toContain("assetValues");
    expect(serialized).not.toContain("totalReserve");
    expect(serialized).not.toContain("walletAddress");
  });
});
