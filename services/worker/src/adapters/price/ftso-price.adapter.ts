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

const feedIds: Record<string, string> = {
  FLR: "0x01464c522f55534400000000000000000000000000",
  BTC: "0x014254432f55534400000000000000000000000000",
  XRP: "0x015852502f55534400000000000000000000000000",
};

type FtsoFeedReader = {
  getFeedById(feedId: string): Promise<readonly [bigint, bigint | number, bigint | number]>;
};

type FtsoPriceAdapterOptions = {
  rpcUrl?: string;
  ftsoV2Address?: string;
  timeoutMs?: number;
  feedReader?: FtsoFeedReader;
  maxStalenessSeconds?: number;
};

export class FtsoPriceAdapter implements PriceAdapter {
  private readonly feedReader: FtsoFeedReader;
  private readonly timeoutMs: number;
  private readonly maxStalenessSeconds: number;

  constructor(options: FtsoPriceAdapterOptions = {}) {
    this.timeoutMs = options.timeoutMs ?? env.FTSO_PRICE_TIMEOUT_MS;
    this.maxStalenessSeconds = options.maxStalenessSeconds ?? 15 * 60;

    if (options.feedReader) {
      this.feedReader = options.feedReader;
      return;
    }

    const rpcUrl = options.rpcUrl ?? env.COSTON2_RPC_URL;
    const ftsoV2Address = options.ftsoV2Address ?? env.FTSOV2_ADDRESS;

    if (env.FTSO_NETWORK !== "coston2") {
      throw new Error(`Unsupported FTSO network: ${env.FTSO_NETWORK}`);
    }

    if (!rpcUrl) {
      throw new Error("COSTON2_RPC_URL is required for FTSO price reads");
    }

    const provider = new JsonRpcProvider(rpcUrl, 114);
    this.feedReader = new Contract(ftsoV2Address, ftsoV2Abi, provider) as unknown as FtsoFeedReader;
  }

  async getPrice(request: PriceRequest): Promise<PriceResult> {
    const baseAsset = getBaseAssetSymbol(request.assetSymbol);
    const feedId = feedIds[baseAsset];

    if (!feedId) {
      throw new Error(`Unsupported FTSO price feed: ${request.assetSymbol}`);
    }

    const [value, rawDecimals, rawTimestamp] = await withTimeout(
      this.feedReader.getFeedById(feedId),
      this.timeoutMs,
    );
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
      price: decimalValueToNumber(value, decimals),
      currency: "USD",
      source: "ftso",
      timestamp,
      decimals,
      feedId,
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

  if (decimals > 0) {
    return Number(value * 10n ** BigInt(decimals));
  }

  const divisor = 10n ** BigInt(Math.abs(decimals));
  const whole = value / divisor;
  const fraction = value % divisor;
  const paddedFraction = fraction.toString().padStart(Math.abs(decimals), "0");

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
