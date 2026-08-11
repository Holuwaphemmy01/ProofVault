import { describe, expect, it } from "vitest";
import { COSTON2_CHAIN_ID, getWalletStatus, maskAddress } from "./wallet-utils";

describe("wallet utils", () => {
  it("returns disconnected state", () => {
    expect(getWalletStatus({
      hasAddress: false,
      isConnecting: false,
      isConnected: false,
      isCoston2: false,
      hasError: false,
    })).toBe("disconnected");
  });

  it("returns connected state on Coston2", () => {
    expect(COSTON2_CHAIN_ID).toBe(114);
    expect(getWalletStatus({
      hasAddress: true,
      isConnecting: false,
      isConnected: true,
      isCoston2: true,
      hasError: false,
    })).toBe("connected");
  });

  it("returns wrong network state", () => {
    expect(getWalletStatus({
      hasAddress: true,
      isConnecting: false,
      isConnected: true,
      isCoston2: false,
      hasError: false,
    })).toBe("wrong-network");
  });

  it("masks a connected address", () => {
    expect(maskAddress("0x1234567890abcdef1234567890abcdef12345678")).toBe("0x1234...5678");
  });
});
