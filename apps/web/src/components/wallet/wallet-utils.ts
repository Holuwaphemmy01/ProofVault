import { createPublicClient, createWalletClient, custom, http, type Chain } from "viem";
import type { Eip1193Provider } from "./wallet-provider";

export const COSTON2_CHAIN_ID = Number(process.env.NEXT_PUBLIC_FLARE_CHAIN_ID ?? 114);
export const COSTON2_CHAIN_ID_HEX = `0x${COSTON2_CHAIN_ID.toString(16)}`;
export const COSTON2_RPC_URL = process.env.NEXT_PUBLIC_Coston2_RPC_URL
  ?? process.env.NEXT_PUBLIC_COSTON2_RPC_URL
  ?? "https://coston2-api.flare.network/ext/C/rpc";

export const coston2 = {
  id: COSTON2_CHAIN_ID,
  name: "Flare Testnet Coston2",
  nativeCurrency: {
    name: "Coston2 Flare",
    symbol: "C2FLR",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [COSTON2_RPC_URL],
    },
    public: {
      http: [COSTON2_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: "Coston2 Explorer",
      url: "https://coston2-explorer.flare.network",
    },
  },
  testnet: true,
} as const satisfies Chain;

export const coston2PublicClient = createPublicClient({
  chain: coston2,
  transport: http(COSTON2_RPC_URL),
});

export function createInjectedWalletClient(provider: Eip1193Provider) {
  return createWalletClient({
    chain: coston2,
    transport: custom(provider),
  });
}

export function maskAddress(address?: string | null) {
  if (!address) {
    return "";
  }

  if (address.length <= 12) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export type WalletStatus = "disconnected" | "connecting" | "connected" | "wrong-network" | "error";

export function getWalletStatus(input: {
  hasAddress: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  isCoston2: boolean;
  hasError: boolean;
}): WalletStatus {
  if (input.hasError) {
    return "error";
  }

  if (input.isConnecting) {
    return "connecting";
  }

  if (!input.hasAddress || !input.isConnected) {
    return "disconnected";
  }

  return input.isCoston2 ? "connected" : "wrong-network";
}

export function getInjectedEthereum(): Eip1193Provider | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (window as Window & { ethereum?: Eip1193Provider }).ethereum ?? null;
}

export async function addOrSwitchToCoston2(provider: Eip1193Provider) {
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: COSTON2_CHAIN_ID_HEX }],
    });
  } catch (error) {
    if (isUnknownChainError(error)) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: COSTON2_CHAIN_ID_HEX,
          chainName: coston2.name,
          nativeCurrency: coston2.nativeCurrency,
          rpcUrls: coston2.rpcUrls.default.http,
          blockExplorerUrls: [coston2.blockExplorers.default.url],
        }],
      });
      return;
    }

    throw error;
  }
}

function isUnknownChainError(error: unknown) {
  return typeof error === "object"
    && error !== null
    && "code" in error
    && (error.code === 4902 || error.code === -32603);
}
