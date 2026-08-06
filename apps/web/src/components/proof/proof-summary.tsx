import { Lock, ShieldCheck } from "@/components/icons"

const rows = [
  { label: "Organization", value: "AtlasX Exchange" },
  { label: "Project Type", value: "Exchange" },
  { label: "Required Threshold", value: "$1,000,000" },
  { label: "Assets Selected", value: "BTC, XRP, FLR, USDC" },
  { label: "Privacy Mode", value: "Confidential Threshold Proof", tone: "violet" as const },
  { label: "Result Visibility", value: "Public pass/fail only" },
]

const pills = ["Treasury privacy", "Private calculation", "On-chain proof", "Cross-chain assets"]

export function ProofSummary() {
  return (
    <div className="space-y-4 lg:sticky lg:top-6">
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
            <ShieldCheck className="h-4 w-4 text-primary" strokeWidth={1.75} />
          </span>
          <h2 className="font-heading text-base font-bold text-foreground">Proof Summary</h2>
        </div>

        <dl className="mt-5 divide-y divide-border">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4 py-3">
              <dt className="text-sm text-muted-foreground">{row.label}</dt>
              <dd
                className={
                  row.tone === "violet"
                    ? "text-right text-sm font-medium text-violet"
                    : "text-right text-sm font-medium text-foreground"
                }
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-border bg-elevated p-3.5">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Wallet addresses and exact balances will be added in the next step and kept confidential.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          ProofVault only publishes the verification result, proof hash, timestamp, and on-chain proof record.
          Sensitive reserve details remain protected.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {pills.map((p) => (
            <span
              key={p}
              className="rounded-full border border-border bg-elevated px-2.5 py-1 text-xs font-medium text-muted-foreground"
            >
              {p}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
