import type { Metadata } from "next";
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
