export interface PriceRequest {
  assetSymbol: string;
}

export interface PriceResult {
  assetSymbol: string;
  feedSymbol?: string;
  price: number;
  currency: "USD";
  source: "mock" | "mock-fallback" | "ftso";
  dataSource?: "FTSO" | "MOCK_PRICE_FALLBACK";
  timestamp?: number;
  decimals?: number;
  feedId?: string;
  contractAddress?: string;
  contractAddressSource?: "contract-registry" | "env-override" | "injected";
}

export interface PriceAdapter {
  getPrice(request: PriceRequest): Promise<PriceResult>;
}
