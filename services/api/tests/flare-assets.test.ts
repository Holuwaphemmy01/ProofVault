import { describe, expect, it } from "vitest";
import { SUPPORTED_ASSETS, isSupportedAsset } from "@proofvault/config";

describe("Flare asset configuration", () => {
  it("marks FXRP and FLR as selectable demo assets", () => {
    expect(isSupportedAsset("FXRP")).toBe(true);
    expect(isSupportedAsset("FLR")).toBe(true);
  });

  it("does not mark planned FAssets as live integrations", () => {
    expect(isSupportedAsset("FBTC")).toBe(false);
    expect(isSupportedAsset("FDOGE")).toBe(false);
  });

  it("does not hardcode fictional FBTC or FDOGE contract addresses", () => {
    const planned = SUPPORTED_ASSETS.filter((asset) => asset.symbol === "FBTC" || asset.symbol === "FDOGE");

    expect(planned).toHaveLength(2);
    expect(planned.every((asset) => asset.available === false)).toBe(true);
    expect(planned.every((asset) => asset.contractAddress === undefined)).toBe(true);
  });
});
