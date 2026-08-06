import type { Metadata } from "next";
import { WalletProvider } from "@/components/wallet";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProofVault",
  description: "Confidential cross-chain proof-of-reserves platform built for Flare",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
