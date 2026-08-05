export interface BalanceRequest {
  chain: string;
  assetSymbol: string;
  walletAddressHash: string;
}

export interface BalanceResult {
  assetSymbol: string;
  chain: string;
  balance: number;
  currency: "USD";
  source: "mock" | "fdc" | "rpc";
}

export interface BalanceAdapter {
  getBalance(request: BalanceRequest): Promise<BalanceResult>;
}
