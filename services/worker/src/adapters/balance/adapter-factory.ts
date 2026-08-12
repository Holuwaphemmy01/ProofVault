import type { BalanceAdapter } from "./balance-adapter.interface.js";
import { env } from "../../lib/env.js";
import { getBaseAssetSymbol } from "@proofvault/config";
import { Erc20BalanceAdapter } from "./erc20-balance.adapter.js";
import { MockBalanceAdapter } from "./mock-balance.adapter.js";

export function getBalanceAdapter(chain: string, assetSymbol?: string): BalanceAdapter {
  if (
    chain.toLowerCase() === "flare"
    && assetSymbol
    && getBaseAssetSymbol(assetSymbol) === "XRP"
    && env.FXRP_TOKEN_ADDRESS
    && env.COSTON2_RPC_URL
  ) {
    return new Erc20BalanceAdapter({
      rpcUrl: env.COSTON2_RPC_URL,
      tokenAddress: env.FXRP_TOKEN_ADDRESS,
    });
  }

  return new MockBalanceAdapter();
}
