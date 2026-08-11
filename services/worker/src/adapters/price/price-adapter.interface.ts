export interface PriceRequest {
  assetSymbol: string;
}

export interface PriceResult {
  assetSymbol: string;
  price: number;
  currency: "USD";
  source: "mock" | "mock-fallback" | "ftso";
  timestamp?: number;
  decimals?: number;
  feedId?: string;
}

export interface PriceAdapter {
  getPrice(request: PriceRequest): Promise<PriceResult>;
}
