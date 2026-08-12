import { Contract, JsonRpcProvider, formatUnits } from "ethers";
import type {
  BalanceAdapter,
  BalanceRequest,
  BalanceResult,
} from "./balance-adapter.interface.js";

const erc20Abi = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
] as const;

export class Erc20BalanceAdapter implements BalanceAdapter {
  constructor(
    private readonly input: {
      rpcUrl: string;
      tokenAddress: string;
    },
  ) {}

  async getBalance(request: BalanceRequest): Promise<BalanceResult> {
    if (!request.walletAddress) {
      throw new Error("walletAddress is required for ERC-20 balance lookup");
    }

    const provider = new JsonRpcProvider(this.input.rpcUrl, 114);
    const token = new Contract(this.input.tokenAddress, erc20Abi, provider);
    const [balance, decimals] = await Promise.all([
      token.balanceOf(request.walletAddress) as Promise<bigint>,
      token.decimals() as Promise<number>,
    ]);

    return {
      assetSymbol: request.assetSymbol,
      chain: request.chain,
      balance: Number(formatUnits(balance, decimals)),
      unit: "asset",
      source: "rpc",
    };
  }
}
