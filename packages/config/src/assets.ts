export type SupportedAsset = {
  symbol: string;
  displayName: string;
  baseAsset: string;
  chain: string;
  decimals: number;
  isFAsset: boolean;
  priceSource: string;
  balanceSource: string;
};

export const SUPPORTED_ASSETS: SupportedAsset[] = [
  {
    symbol: "FXRP",
    displayName: "Flare XRP",
    baseAsset: "XRP",
    chain: "flare",
    decimals: 6,
    isFAsset: true,
    priceSource: "mock-ftso-xrp",
    balanceSource: "mock-fasset-fxrp",
  },
  {
    symbol: "FBTC",
    displayName: "Flare Bitcoin",
    baseAsset: "BTC",
    chain: "flare",
    decimals: 8,
    isFAsset: true,
    priceSource: "mock-ftso-btc",
    balanceSource: "mock-fasset-fbtc",
  },
  {
    symbol: "FDOGE",
    displayName: "Flare Dogecoin",
    baseAsset: "DOGE",
    chain: "flare",
    decimals: 8,
    isFAsset: true,
    priceSource: "mock-ftso-doge",
    balanceSource: "mock-fasset-fdoge",
  },
  {
    symbol: "FLR",
    displayName: "Flare",
    baseAsset: "FLR",
    chain: "flare",
    decimals: 18,
    isFAsset: false,
    priceSource: "mock-ftso-flr",
    balanceSource: "mock-flare-rpc",
  },
  {
    symbol: "USDX",
    displayName: "USD Stablecoin Placeholder",
    baseAsset: "USD",
    chain: "flare",
    decimals: 6,
    isFAsset: false,
    priceSource: "mock-stablecoin-usd",
    balanceSource: "mock-stablecoin-balance",
  },
];

export function getAssetBySymbol(symbol: string) {
  return SUPPORTED_ASSETS.find((asset) => asset.symbol.toUpperCase() === symbol.toUpperCase());
}

export function isSupportedAsset(symbol: string) {
  return Boolean(getAssetBySymbol(symbol));
}

export function getBaseAssetSymbol(symbol: string) {
  return getAssetBySymbol(symbol)?.baseAsset ?? symbol.toUpperCase();
}
