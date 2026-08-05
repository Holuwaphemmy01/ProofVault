export interface BalanceRequest {
  chain: string;
  assetSymbol: string;
  walletAddressHash: string;
}

export interface BalanceResult {
  assetSymbol: string;
  chain: string;
  balance: number;
  unit: "asset";
  source: "mock" | "fdc" | "rpc";
}

export interface BalanceAdapter {
  getBalance(request: BalanceRequest): Promise<BalanceResult>;
}
