"use client";

import { useWallet } from "./wallet-provider";

export function ConnectWalletButton() {
  const {
    maskedAddress,
    connect,
    disconnect,
    switchToCoston2,
    status,
    isConnected,
    isCoston2,
  } = useWallet();

  if (status === "wrong-network" || (isConnected && !isCoston2)) {
    return (
      <button
        type="button"
        onClick={switchToCoston2}
        className="inline-flex h-9 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
      >
        Switch to Flare Coston2
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={isConnected ? disconnect : connect}
      disabled={status === "connecting"}
      className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-elevated px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
    >
      {status === "connecting" ? "Connecting..." : isConnected ? maskedAddress : "Connect wallet"}
    </button>
  );
}
