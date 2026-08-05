import type {
  BalanceAdapter,
  BalanceRequest,
  BalanceResult,
} from "./balance-adapter.interface.js";
import { getBaseAssetSymbol } from "@proofvault/config";

export class MockBalanceAdapter implements BalanceAdapter {
  async getBalance(request: BalanceRequest): Promise<BalanceResult> {
    return {
      assetSymbol: request.assetSymbol,
      chain: request.chain,
      balance: this.getMockAssetBalance(request.assetSymbol),
      unit: "asset",
      source: "mock",
    };
  }

  private getMockAssetBalance(assetSymbol: string) {
    switch (getBaseAssetSymbol(assetSymbol)) {
      case "BTC":
        return 0.025;
      case "XRP":
        return 500000;
      case "DOGE":
        return 2000000;
      case "ETH":
        return 10;
      case "FLR":
        return 100000;
      case "USD":
        return 100000;
      default:
        return 100000;
    }
  }
}
