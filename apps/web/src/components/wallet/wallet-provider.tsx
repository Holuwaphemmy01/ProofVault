"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PublicClient, WalletClient } from "viem";
import {
  COSTON2_CHAIN_ID,
  addOrSwitchToCoston2,
  coston2PublicClient,
  createInjectedWalletClient,
  getInjectedEthereum,
  maskAddress,
} from "./wallet-utils";

type WalletStatus = "disconnected" | "connecting" | "connected" | "wrong-network" | "error";

type WalletContextValue = {
  address: string | null;
  maskedAddress: string;
  chainId: number | null;
  provider: PublicClient | null;
  walletClient: WalletClient | null;
  status: WalletStatus;
  isConnected: boolean;
  isCoston2: boolean;
  error: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToCoston2: () => Promise<void>;
};

export type Eip1193Provider = {
  request<T = unknown>(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<T>;
  on?(event: "accountsChanged", handler: (accounts: string[]) => void): void;
  on?(event: "chainChanged", handler: (chainId: string) => void): void;
  removeListener?(event: "accountsChanged", handler: (accounts: string[]) => void): void;
  removeListener?(event: "chainChanged", handler: (chainId: string) => void): void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [injectedProvider, setInjectedProvider] = useState<Eip1193Provider | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [status, setStatus] = useState<WalletStatus>("disconnected");
  const [error, setError] = useState("");

  const isCoston2 = chainId === COSTON2_CHAIN_ID;
  const isConnected = Boolean(address);

  const refreshChainId = useCallback(async (walletProvider: Eip1193Provider) => {
    const chainIdHex = await walletProvider.request<string>({ method: "eth_chainId" });
    const nextChainId = Number.parseInt(chainIdHex, 16);

    setChainId(Number.isNaN(nextChainId) ? null : nextChainId);
    return nextChainId;
  }, []);

  const connect = useCallback(async () => {
    setError("");
    setStatus("connecting");

    const walletProvider = getInjectedEthereum();

    if (!walletProvider) {
      setStatus("error");
      setError("No browser wallet found. Install MetaMask or another EVM wallet.");
      return;
    }

    try {
      const accounts = await walletProvider.request<string[]>({ method: "eth_requestAccounts" });
      const connectedAddress = accounts[0] ?? null;
      const nextChainId = await refreshChainId(walletProvider);

      if (!connectedAddress) {
        setStatus("disconnected");
        setAddress(null);
        return;
      }

      setInjectedProvider(walletProvider);
      setWalletClient(createInjectedWalletClient(walletProvider));
      setAddress(connectedAddress);
      setStatus(nextChainId === COSTON2_CHAIN_ID ? "connected" : "wrong-network");
    } catch (walletError) {
      setStatus("error");
      setError(getWalletErrorMessage(walletError));
    }
  }, [refreshChainId]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setWalletClient(null);
    setStatus("disconnected");
    setError("");
  }, []);

  const switchToCoston2 = useCallback(async () => {
    const walletProvider = injectedProvider ?? getInjectedEthereum();

    if (!walletProvider) {
      setStatus("error");
      setError("No browser wallet found. Install MetaMask or another EVM wallet.");
      return;
    }

    try {
      await addOrSwitchToCoston2(walletProvider);
      setInjectedProvider(walletProvider);
      setWalletClient(createInjectedWalletClient(walletProvider));
      setChainId(COSTON2_CHAIN_ID);
      setStatus(address ? "connected" : "disconnected");
      setError("");
    } catch (walletError) {
      setStatus("error");
      setError(getWalletErrorMessage(walletError));
    }
  }, [address, injectedProvider]);

  useEffect(() => {
    const walletProvider = getInjectedEthereum();

    if (!walletProvider) {
      return;
    }

    setInjectedProvider(walletProvider);
    setWalletClient(createInjectedWalletClient(walletProvider));

    walletProvider.request<string[]>({ method: "eth_accounts" })
      .then((accounts) => {
        const connectedAddress = accounts[0] ?? null;
        setAddress(connectedAddress);
        return refreshChainId(walletProvider).then((nextChainId) => {
          if (!connectedAddress) {
            setStatus("disconnected");
          } else {
            setStatus(nextChainId === COSTON2_CHAIN_ID ? "connected" : "wrong-network");
          }
        });
      })
      .catch(() => {
        setStatus("disconnected");
      });

    const handleAccountsChanged = (accounts: string[]) => {
      const nextAddress = accounts[0] ?? null;
      setAddress(nextAddress);
      setStatus(nextAddress ? (chainId === COSTON2_CHAIN_ID ? "connected" : "wrong-network") : "disconnected");
    };
    const handleChainChanged = (chainIdHex: string) => {
      const nextChainId = Number.parseInt(chainIdHex, 16);
      setChainId(Number.isNaN(nextChainId) ? null : nextChainId);
      setStatus(address && nextChainId === COSTON2_CHAIN_ID ? "connected" : address ? "wrong-network" : "disconnected");
    };

    walletProvider.on?.("accountsChanged", handleAccountsChanged);
    walletProvider.on?.("chainChanged", handleChainChanged);

    return () => {
      walletProvider.removeListener?.("accountsChanged", handleAccountsChanged);
      walletProvider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [address, chainId, refreshChainId]);

  const value = useMemo<WalletContextValue>(
    () => ({
      address,
      maskedAddress: maskAddress(address),
      chainId,
      provider: coston2PublicClient,
      walletClient,
      status,
      isConnected,
      isCoston2,
      error,
      connect,
      disconnect,
      switchToCoston2,
    }),
    [address, chainId, connect, disconnect, error, isConnected, isCoston2, status, switchToCoston2, walletClient],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useWallet must be used inside WalletProvider");
  }

  return context;
}

function getWalletErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "code" in error && error.code === 4001) {
    return "Wallet connection rejected.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Wallet request failed.";
}
