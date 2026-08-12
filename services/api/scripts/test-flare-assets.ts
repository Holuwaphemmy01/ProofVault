import dotenv from "dotenv";
import { getFAssetMetadata, getSupportedFlareAssets } from "../src/services/flare-assets.service.js";

dotenv.config();

const fxrp = await getFAssetMetadata("FXRP");
const assets = await getSupportedFlareAssets();

console.log(JSON.stringify({
  fxrp: {
    symbol: fxrp.symbol,
    displayName: fxrp.displayName,
    network: fxrp.network,
    contractAddress: fxrp.contractAddress,
    assetManagerAddress: fxrp.assetManagerAddress,
    decimals: fxrp.decimals,
    available: fxrp.available,
    priceFeedSymbol: fxrp.priceFeedSymbol,
  },
  selectableAssets: assets
    .filter((asset) => asset.available && asset.network === "coston2")
    .map((asset) => ({
      symbol: asset.symbol,
      contractAddress: asset.contractAddress,
      decimals: asset.decimals,
      priceFeedSymbol: asset.priceFeedSymbol,
    })),
}, null, 2));
