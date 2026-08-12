export type SupportedAsset = {
  symbol: string;
  displayName: string;
  type: "fasset" | "native" | "stablecoin" | "external" | "planned-fasset";
  baseAsset: string;
  chain: string;
  decimals: number;
  isFAsset: boolean;
  priceSource: string;
  balanceSource: string;
  available: boolean;
  priceFeedSymbol: string;
  contractAddress?: string;
};

export const SUPPORTED_ASSETS: SupportedAsset[] = [
  {
    symbol: "FXRP",
    displayName: "FXRP",
    type: "fasset",
    baseAsset: "XRP",
    chain: "flare",
    decimals: 6,
    isFAsset: true,
    priceSource: "ftso-xrp-usd",
    balanceSource: "fasset-erc20",
    available: true,
    priceFeedSymbol: "XRP/USD",
  },
  {
    symbol: "FBTC",
    displayName: "FBTC",
    type: "planned-fasset",
    baseAsset: "BTC",
    chain: "flare",
    decimals: 8,
    isFAsset: true,
    priceSource: "ftso-btc-usd",
    balanceSource: "not-configured",
    available: false,
    priceFeedSymbol: "BTC/USD",
  },
  {
    symbol: "FDOGE",
    displayName: "FDOGE",
    type: "planned-fasset",
    baseAsset: "DOGE",
    chain: "flare",
    decimals: 8,
    isFAsset: true,
    priceSource: "ftso-doge-usd",
    balanceSource: "not-configured",
    available: false,
    priceFeedSymbol: "DOGE/USD",
  },
  {
    symbol: "FLR",
    displayName: "Flare",
    type: "native",
    baseAsset: "FLR",
    chain: "flare",
    decimals: 18,
    isFAsset: false,
    priceSource: "ftso-flr-usd",
    balanceSource: "native-rpc",
    available: true,
    priceFeedSymbol: "FLR/USD",
  },
  {
    symbol: "USDT0",
    displayName: "USDT0",
    type: "stablecoin",
    baseAsset: "USDT",
    chain: "flare",
    decimals: 18,
    isFAsset: false,
    priceSource: "stablecoin-usd",
    balanceSource: "erc20",
    available: true,
    priceFeedSymbol: "USDT/USD",
    contractAddress: "0x479854495cefBc8D12B971A3Ec4d18E6dbcE81a3",
  },
  {
    symbol: "XRP",
    displayName: "XRP",
    type: "external",
    baseAsset: "XRP",
    chain: "xrpl-testnet",
    decimals: 6,
    isFAsset: false,
    priceSource: "ftso-xrp-usd",
    balanceSource: "fdc-evidence",
    available: true,
    priceFeedSymbol: "XRP/USD",
  },
  {
    symbol: "BTC",
    displayName: "Bitcoin",
    type: "external",
    baseAsset: "BTC",
    chain: "btc-testnet",
    decimals: 8,
    isFAsset: false,
    priceSource: "ftso-btc-usd",
    balanceSource: "fdc-evidence",
    available: true,
    priceFeedSymbol: "BTC/USD",
  },
  {
    symbol: "DOGE",
    displayName: "Dogecoin",
    type: "external",
    baseAsset: "DOGE",
    chain: "doge-testnet",
    decimals: 8,
    isFAsset: false,
    priceSource: "not-configured",
    balanceSource: "fdc-evidence",
    available: true,
    priceFeedSymbol: "DOGE/USD",
  },
];

export function getAssetBySymbol(symbol: string) {
  return SUPPORTED_ASSETS.find((asset) => asset.symbol.toUpperCase() === symbol.toUpperCase());
}

export function isSupportedAsset(symbol: string) {
  return Boolean(getAssetBySymbol(symbol)?.available);
}

export function getBaseAssetSymbol(symbol: string) {
  return getAssetBySymbol(symbol)?.baseAsset ?? symbol.toUpperCase();
}
