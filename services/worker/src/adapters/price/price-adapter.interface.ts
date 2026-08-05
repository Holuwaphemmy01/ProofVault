export interface PriceRequest {
  assetSymbol: string;
}

export interface PriceResult {
  assetSymbol: string;
  price: number;
  currency: "USD";
  source: "mock" | "ftso";
}

export interface PriceAdapter {
  getPrice(request: PriceRequest): Promise<PriceResult>;
}
