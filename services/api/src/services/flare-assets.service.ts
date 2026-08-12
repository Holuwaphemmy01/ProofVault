import { Contract, JsonRpcProvider, ZeroAddress } from "ethers";
import { SUPPORTED_ASSETS, type SupportedAsset } from "@proofvault/config";
import { env } from "../lib/env.js";

const flareContractRegistryAbi = [
  "function getContractAddressByName(string name) view returns (address)",
] as const;
const assetManagerAbi = [
  "function fAsset() view returns (address)",
] as const;
const erc20MetadataAbi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
] as const;

const defaultCoston2RpcUrl = "https://coston2-api.flare.network/ext/C/rpc";
const defaultFlareContractRegistryAddress = "0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019";

export type FlareAssetMetadata = {
  symbol: string;
  displayName: string;
  type: SupportedAsset["type"];
  baseAsset: string;
  network: "coston2" | "external";
  contractAddress?: string;
  assetManagerAddress?: string;
  decimals: number;
  available: boolean;
  priceFeedSymbol: string;
};

export async function getSupportedFlareAssets() {
  const assets = await Promise.all(SUPPORTED_ASSETS.map(async (asset) => {
    if (asset.symbol === "FXRP") {
      return getFAssetMetadata("FXRP");
    }

    return toPublicAssetMetadata(asset);
  }));

  return assets;
}

export async function getFAssetMetadata(symbol: string): Promise<FlareAssetMetadata> {
  const normalized = symbol.toUpperCase();
  const asset = SUPPORTED_ASSETS.find((item) => item.symbol === normalized);

  if (!asset || !asset.isFAsset) {
    throw new Error(`Unsupported FAsset metadata symbol: ${symbol}`);
  }

  if (normalized !== "FXRP") {
    return {
      ...toPublicAssetMetadata(asset),
      available: false,
    };
  }

  const provider = new JsonRpcProvider(env.COSTON2_RPC_URL || env.RPC_URL || defaultCoston2RpcUrl, 114);

  try {
    const registry = new Contract(
      env.FLARE_CONTRACT_REGISTRY_ADDRESS || defaultFlareContractRegistryAddress,
      flareContractRegistryAbi,
      provider,
    );
    const assetManagerAddress = await registry.getContractAddressByName("AssetManagerFXRP") as string;

    if (!assetManagerAddress || assetManagerAddress === ZeroAddress) {
      throw new Error("AssetManagerFXRP was not found in Flare Contract Registry");
    }

    const assetManager = new Contract(assetManagerAddress, assetManagerAbi, provider);
    const fAssetAddress = await assetManager.fAsset() as string;

    if (!fAssetAddress || fAssetAddress === ZeroAddress) {
      throw new Error("FXRP token address was not resolved from AssetManager");
    }

    const token = new Contract(fAssetAddress, erc20MetadataAbi, provider);
    const [tokenName, tokenDecimals] = await Promise.all([
      token.name().catch(() => asset.displayName) as Promise<string>,
      token.decimals().catch(() => asset.decimals) as Promise<number | bigint>,
    ]);

    return {
      symbol: asset.symbol,
      displayName: tokenName || asset.displayName,
      type: asset.type,
      baseAsset: asset.baseAsset,
      network: "coston2",
      contractAddress: fAssetAddress,
      assetManagerAddress,
      decimals: Number(tokenDecimals),
      available: true,
      priceFeedSymbol: asset.priceFeedSymbol,
    };
  } catch {
    return {
      ...toPublicAssetMetadata(asset),
      available: false,
    };
  } finally {
    provider.destroy();
  }
}

function toPublicAssetMetadata(asset: SupportedAsset): FlareAssetMetadata {
  return {
    symbol: asset.symbol,
    displayName: asset.displayName,
    type: asset.type,
    baseAsset: asset.baseAsset,
    network: asset.type === "external" ? "external" : "coston2",
    contractAddress: asset.contractAddress,
    decimals: asset.decimals,
    available: asset.available,
    priceFeedSymbol: asset.priceFeedSymbol,
  };
}
