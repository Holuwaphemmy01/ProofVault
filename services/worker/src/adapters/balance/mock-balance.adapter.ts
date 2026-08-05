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
      balance: this.getMockUsdBalance(request.assetSymbol),
      currency: "USD",
      source: "mock",
    };
  }

  private getMockUsdBalance(assetSymbol: string) {
    switch (assetSymbol.toUpperCase()) {
      case "BTC":
        return 750000;
      case "XRP":
        return 200000;
      case "DOGE":
        return 150000;
      case "ETH":
        return 300000;
      default:
        return 100000;
    }
  }
}
