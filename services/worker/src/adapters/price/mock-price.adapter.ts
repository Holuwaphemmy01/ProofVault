import type {
  PriceAdapter,
  PriceRequest,
  PriceResult,
} from "./price-adapter.interface.js";

export class MockPriceAdapter implements PriceAdapter {
  async getPrice(request: PriceRequest): Promise<PriceResult> {
    return {
      assetSymbol: request.assetSymbol,
      price: this.getMockUsdPrice(request.assetSymbol),
      currency: "USD",
      source: "mock",
    };
  }

  private getMockUsdPrice(assetSymbol: string) {
    switch (assetSymbol.toUpperCase()) {
      case "BTC":
        return 27000;
      case "XRP":
        return 0.6;
      case "DOGE":
        return 0.08;
      case "ETH":
        return 1800;
      default:
        return 1;
    }
  }
}
