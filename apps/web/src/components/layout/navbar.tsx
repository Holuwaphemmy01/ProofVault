import Link from "next/link";
import { ConnectWalletButton } from "@/components/wallet";
import { Logo } from "@/components/landing/logo";

const links = [
  { label: "Landing", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Create Proof", href: "/create-proof" },
  { label: "Proof", href: "/proof/demo-proof-001" },
  { label: "Verify", href: "/verify/atlasx-exchange" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" aria-label="ProofVault home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <ConnectWalletButton />
      </div>
    </header>
  );
}
