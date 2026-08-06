import { Lock } from "@/components/icons"
import { StatusBadge } from "@/components/dashboard/status-badge"

const assets = ["BTC", "XRP", "DOGE", "FLR", "USDC"]

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{children}</span>
    </div>
  )
}

export function ReserveHealth() {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Reserve Health Overview
        </h2>
        <StatusBadge tone="green" dot>
          Passed
        </StatusBadge>
      </div>

      {/* Threshold visualization */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Required Threshold</span>
          <span className="font-medium text-green">Verified Above Threshold</span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-elevated">
          <div className="absolute inset-y-0 left-0 w-[82%] rounded-full bg-green/80" />
          <div className="absolute inset-y-0 left-[62%] w-px bg-foreground/40" />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-subtle">
          <span>$0</span>
          <span className="translate-x-2">Required $1,000,000</span>
          <span>Verified coverage</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
        <Row label="Required Threshold">$1,000,000</Row>
        <Row label="Verified Coverage">
          <span className="text-green">Above threshold</span>
        </Row>
        <Row label="Privacy Mode">Wallet details hidden</Row>
        <Row label="Proof Result">
          <span className="text-green">Passed</span>
        </Row>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-subtle">
          Supported Assets
        </p>
        <div className="flex flex-wrap gap-2">
          {assets.map((a) => (
            <span
              key={a}
              className="rounded-md border border-border bg-elevated px-2.5 py-1 font-mono text-xs text-foreground"
            >
              {a}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-lg border border-violet/25 bg-violet/10 px-4 py-3 text-xs text-violet">
        <Lock className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        Exact wallet balances and treasury strategy remain confidential.
      </div>
    </section>
  )
}
