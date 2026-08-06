"use client";

import { createContext, useContext, useMemo, useState } from "react";

type WalletContextValue = {
  address: string | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);

  const value = useMemo<WalletContextValue>(
    () => ({
      address,
      isConnected: Boolean(address),
      connect: () => setAddress("0x92A7...F13C"),
      disconnect: () => setAddress(null),
    }),
    [address],
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
