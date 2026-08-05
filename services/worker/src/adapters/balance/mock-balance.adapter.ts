import type {
  BalanceAdapter,
  BalanceRequest,
  BalanceResult,
} from "./balance-adapter.interface.js";

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
    switch (assetSymbol.toUpperCase()) {
      case "BTC":
        return 0.025;
      case "XRP":
        return 500000;
      case "DOGE":
        return 2000000;
      case "ETH":
        return 10;
      default:
        return 100000;
    }
  }
}
