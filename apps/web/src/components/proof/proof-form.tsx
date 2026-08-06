import { ChevronDown } from "@/components/icons"

const assets = [
  { symbol: "BTC", name: "Bitcoin", selected: true },
  { symbol: "XRP", name: "XRP", selected: true },
  { symbol: "DOGE", name: "Dogecoin", selected: false },
  { symbol: "FLR", name: "Flare", selected: true },
  { symbol: "USDC", name: "USD Coin", selected: true },
  { symbol: "FAssets", name: "FAssets", selected: false },
]

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2 flex items-baseline justify-between">
      <label className="text-sm font-medium text-foreground">{children}</label>
      {hint && <span className="text-xs text-subtle">{hint}</span>}
    </div>
  )
}

const inputBase =
  "w-full rounded-lg border border-border bg-elevated px-3.5 py-2.5 text-sm text-foreground placeholder:text-subtle focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40"

export function ProofForm() {
  return (
    <section className="rounded-xl border border-border bg-card p-6 lg:p-7">
      <h2 className="font-heading text-lg font-bold text-foreground">Proof Details</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        Start by defining what your organization wants to prove. Sensitive reserve data will remain private.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <FieldLabel>Project Name</FieldLabel>
          <input className={inputBase} defaultValue="AtlasX Exchange" placeholder="Enter project or organization name" />
        </div>

        <div>
          <FieldLabel>Project Type</FieldLabel>
          <div className="relative">
            <select
              defaultValue="Exchange"
              className={`${inputBase} appearance-none pr-10`}
            >
              <option>Exchange</option>
              <option>DAO Treasury</option>
              <option>Bridge Protocol</option>
              <option>Lending Protocol</option>
              <option>Stablecoin Issuer</option>
              <option>Asset-backed Token</option>
              <option>Other</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          </div>
        </div>

        <div className="md:col-span-2">
          <FieldLabel>Proof Name</FieldLabel>
          <input
            className={inputBase}
            defaultValue="July 2026 Reserve Verification"
            placeholder="Example: Q3 Treasury Reserve Proof"
          />
        </div>

        <div className="md:col-span-2">
          <FieldLabel hint="The minimum reserve value your project must prove.">
            Required Reserve Threshold
          </FieldLabel>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-subtle">$</span>
              <input className={`${inputBase} pl-7`} defaultValue="1,000,000" />
            </div>
            <div className="relative">
              <select defaultValue="USD" className={`${inputBase} appearance-none pr-9`}>
                <option>USD</option>
                <option>EUR</option>
                <option>USDC</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <FieldLabel hint="Select the assets held in reserve.">Supported Asset Group</FieldLabel>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {assets.map((a) => (
            <button
              key={a.symbol}
              type="button"
              className={
                a.selected
                  ? "flex items-center justify-between rounded-lg border border-primary/50 bg-primary/10 px-3.5 py-2.5 text-left transition-colors"
                  : "flex items-center justify-between rounded-lg border border-border bg-elevated px-3.5 py-2.5 text-left transition-colors hover:border-border/80"
              }
            >
              <span>
                <span className={a.selected ? "text-sm font-semibold text-primary" : "text-sm font-semibold text-foreground"}>
                  {a.symbol}
                </span>
                <span className="ml-2 text-xs text-subtle">{a.name}</span>
              </span>
              <span
                className={
                  a.selected
                    ? "flex h-4 w-4 items-center justify-center rounded-[4px] bg-primary text-[10px] font-bold text-primary-foreground"
                    : "h-4 w-4 rounded-[4px] border border-border"
                }
              >
                {a.selected ? "✓" : ""}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 max-w-xs">
        <FieldLabel>Verification Frequency</FieldLabel>
        <div className="relative">
          <select defaultValue="One-time proof" className={`${inputBase} appearance-none pr-10`}>
            <option>One-time proof</option>
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
        </div>
      </div>
    </section>
  )
}
