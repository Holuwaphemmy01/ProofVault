import Link from "next/link"
import { Logo } from "@/components/landing/logo"
import {
  LayoutGrid,
  FileCheck2,
  Wallet,
  Globe,
  Settings,
  BookOpen,
} from "@/components/icons"

const nav = [
  { label: "Overview", href: "/dashboard", icon: LayoutGrid },
  { label: "Proof Requests", href: "/create-proof", icon: FileCheck2 },
  { label: "Reserve Sources", href: "/dashboard", icon: Wallet },
  { label: "Public Verification", href: "/verify/atlasx-exchange", icon: Globe },
  { label: "Settings", href: "/dashboard", icon: Settings },
  { label: "Docs", href: "/", icon: BookOpen },
]

export function Sidebar({ activeItem = "Overview" }: { activeItem?: string }) {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-[#0B1120]">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6">
        {nav.map((item) => {
          const Icon = item.icon
          const active = item.label === activeItem
          return (
            <Link
              key={item.label}
              href={item.href}
              className={
                active
                  ? "flex items-center gap-3 rounded-md border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary"
                  : "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground"
              }
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Organization
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">AtlasX Exchange</p>
          <p className="mt-3 font-mono text-xs text-muted-foreground">0x92A7...F13C</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green" />
            <span className="text-xs font-medium text-green">Connected</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
