import { Contract, JsonRpcProvider } from "ethers";
import { getBaseAssetSymbol } from "@proofvault/config";
import { env } from "../../lib/env.js";
import type {
  PriceAdapter,
  PriceRequest,
  PriceResult,
} from "./price-adapter.interface.js";

const ftsoV2Abi = [
  "function getFeedById(bytes21 _feedId) external payable returns (uint256 _value, int8 _decimals, uint64 _timestamp)",
] as const;
const flareContractRegistryAbi = [
  "function getContractAddressByName(string _name) external view returns (address)",
] as const;
const zeroAddress = "0x0000000000000000000000000000000000000000";

const feedDefinitions: Record<string, { feedSymbol: string; feedId: string }> = {
  FLR: {
    feedSymbol: "FLR/USD",
    feedId: "0x01464c522f55534400000000000000000000000000",
  },
  BTC: {
    feedSymbol: "BTC/USD",
    feedId: "0x014254432f55534400000000000000000000000000",
  },
  XRP: {
    feedSymbol: "XRP/USD",
    feedId: "0x015852502f55534400000000000000000000000000",
  },
  DOGE: {
    feedSymbol: "DOGE/USD",
    feedId: "0x01444f47452f555344000000000000000000000000",
  },
};

type FtsoFeedReader = {
  getFeedById(feedId: string): Promise<readonly [bigint, bigint | number, bigint | number]>;
};
type FtsoContractResolution = {
  contractAddress: string;
  contractAddressSource: "contract-registry" | "env-override" | "injected";
};

type FtsoPriceAdapterOptions = {
  rpcUrl?: string;
  ftsoV2Address?: string;
  contractRegistryAddress?: string;
  timeoutMs?: number;
  feedReader?: FtsoFeedReader;
  maxStalenessSeconds?: number;
};

export class FtsoPriceAdapter implements PriceAdapter {
  private readonly feedReader: FtsoFeedReader;
  private readonly timeoutMs: number;
  private readonly maxStalenessSeconds: number;
  private readonly contractResolution: Promise<FtsoContractResolution>;

  constructor(options: FtsoPriceAdapterOptions = {}) {
    this.timeoutMs = options.timeoutMs ?? env.FTSO_PRICE_TIMEOUT_MS;
    this.maxStalenessSeconds = options.maxStalenessSeconds ?? 15 * 60;

    if (options.feedReader) {
      this.feedReader = options.feedReader;
      this.contractResolution = Promise.resolve({
        contractAddress: options.ftsoV2Address ?? "",
        contractAddressSource: "injected",
      });
      return;
    }

    const rpcUrl = options.rpcUrl ?? env.COSTON2_RPC_URL;

    if (env.FTSO_NETWORK !== "coston2") {
      throw new Error(`Unsupported FTSO network: ${env.FTSO_NETWORK}`);
    }

    if (!rpcUrl) {
      throw new Error("COSTON2_RPC_URL is required for FTSO price reads");
    }

    const provider = new JsonRpcProvider(rpcUrl, 114);
    this.contractResolution = resolveFtsoV2Contract({
      provider,
      envOverrideAddress: options.ftsoV2Address ?? env.FTSOV2_ADDRESS,
      registryAddress: options.contractRegistryAddress ?? env.FDC_CONTRACT_REGISTRY_ADDRESS,
    });
    this.feedReader = {
      getFeedById: async (feedId) => {
        const { contractAddress } = await this.contractResolution;
        const contract = new Contract(contractAddress, ftsoV2Abi, provider);

        return contract.getFeedById.staticCall(feedId, { value: 0n }) as Promise<
          readonly [bigint, bigint | number, bigint | number]
        >;
      },
    };
  }

  async getPrice(request: PriceRequest): Promise<PriceResult> {
    const baseAsset = getBaseAssetSymbol(request.assetSymbol);
    const feed = feedDefinitions[baseAsset];

    if (!feed) {
      throw new Error(`Unsupported FTSO price feed: ${request.assetSymbol}`);
    }

    const [value, rawDecimals, rawTimestamp] = await withTimeout(
      this.feedReader.getFeedById(feed.feedId),
      this.timeoutMs,
    );
    const contractResolution = await this.contractResolution;
    const decimals = Number(rawDecimals);
    const timestamp = Number(rawTimestamp);

    if (value <= 0n || !Number.isInteger(decimals) || !Number.isFinite(timestamp) || timestamp <= 0) {
      throw new Error(`Malformed FTSO price result for ${request.assetSymbol}`);
    }

    const now = Math.floor(Date.now() / 1000);

    if (timestamp > now + 60 || now - timestamp > this.maxStalenessSeconds) {
      throw new Error(`Stale FTSO price result for ${request.assetSymbol}`);
    }

    return {
      assetSymbol: request.assetSymbol,
      feedSymbol: feed.feedSymbol,
      price: decimalValueToNumber(value, decimals),
      currency: "USD",
      source: "ftso",
      dataSource: "FTSO",
      timestamp,
      decimals,
      feedId: feed.feedId,
      contractAddress: contractResolution.contractAddress,
      contractAddressSource: contractResolution.contractAddressSource,
    };
  }
}

export function decimalValueToNumber(value: bigint, decimals: number) {
  if (!Number.isInteger(decimals)) {
    throw new Error("FTSO decimals must be an integer");
  }

  if (decimals === 0) {
    return Number(value);
  }

  if (decimals < 0) {
    return Number(value * 10n ** BigInt(Math.abs(decimals)));
  }

  const divisor = 10n ** BigInt(decimals);
  const whole = value / divisor;
  const fraction = value % divisor;
  const paddedFraction = fraction.toString().padStart(decimals, "0");

  return Number(`${whole.toString()}.${paddedFraction}`);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`FTSO price request timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

async function resolveFtsoV2Contract(input: {
  provider: JsonRpcProvider;
  registryAddress: string;
  envOverrideAddress: string;
}): Promise<FtsoContractResolution> {
  try {
    const registry = new Contract(input.registryAddress, flareContractRegistryAbi, input.provider);
    const contractAddress = await registry.getContractAddressByName("FtsoV2") as string;

    if (contractAddress && contractAddress !== zeroAddress) {
      return {
        contractAddress,
        contractAddressSource: "contract-registry",
      };
    }
  } catch (error) {
    if (!input.envOverrideAddress) {
      throw error;
    }
  }

  if (!input.envOverrideAddress) {
    throw new Error("FtsoV2 contract address could not be resolved from Flare Contract Registry");
  }

  return {
    contractAddress: input.envOverrideAddress,
    contractAddressSource: "env-override",
  };
}
