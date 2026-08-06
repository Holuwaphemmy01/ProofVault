"use client";

import { useWallet } from "./wallet-provider";

export function ConnectWalletButton() {
  const { address, connect, disconnect, isConnected } = useWallet();

  return (
    <button
      type="button"
      onClick={isConnected ? disconnect : connect}
      className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-elevated px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
    >
      {isConnected ? address : "Connect wallet"}
    </button>
  );
}
