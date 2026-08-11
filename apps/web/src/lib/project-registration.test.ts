import { describe, expect, it } from "vitest";
import { buildProjectRegistrationPayload } from "./project-registration";

describe("project registration payload", () => {
  it("uses the connected wallet address as ownerWallet", () => {
    const connectedAddress = "0x1234567890abcdef1234567890abcdef12345678";

    expect(buildProjectRegistrationPayload({
      name: "AtlasX Exchange",
      slug: "atlasx-exchange",
      website: "https://atlasx.exchange",
      projectType: "exchange",
      description: "Confidential proof-of-reserves",
    }, connectedAddress)).toMatchObject({
      ownerWallet: connectedAddress,
    });
  });
});
