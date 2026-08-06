import { Lock, ShieldCheck, CircleCheck, Hash, Clock, Link2 } from '@/components/icons'

const sources = [
  { label: 'BTC Reserve Wallet', tag: 'BTC' },
  { label: 'XRP Treasury', tag: 'XRP' },
  { label: 'DOGE Reserve', tag: 'DOGE' },
  { label: 'FLR Vault', tag: 'FLR' },
  { label: 'USDC Liquidity', tag: 'USDC' },
]

const shielded = [
  'Encrypted inputs',
  'Private threshold calculation',
  'Wallet details protected',
  'Treasury strategy hidden',
]

export function ProofEngine() {
  return (
    <div className="relative w-full">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-navy/80 p-5 shadow-2xl shadow-black/40 sm:p-6">
        {/* header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green" />
            <span className="text-xs font-medium text-muted-foreground">
              The Proof Engine
            </span>
          </div>
          <span className="rounded-full border border-border bg-elevated px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-subtle">
            Live
          </span>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
          {/* Private sources */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-subtle">
              Private reserve sources
            </p>
            <div className="flex flex-col gap-2">
              {sources.map((s) => (
                <div
                  key={s.tag}
                  className="flex items-center justify-between rounded-lg border border-border/70 bg-elevated px-3 py-2"
                >
                  <span className="flex items-center gap-2 text-xs text-foreground">
                    <Lock className="h-3.5 w-3.5 text-subtle" />
                    {s.label}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {s.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Connector + confidential core */}
          <div className="flex items-center justify-center py-2 lg:py-0">
            <div className="flex w-full flex-col items-center gap-3 lg:w-[168px]">
              <FlowArrow />
              <div className="w-full rounded-xl border border-violet/40 bg-violet/[0.07] p-4 text-center">
                <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg border border-violet/40 bg-violet/10">
                  <ShieldCheck className="h-5 w-5 text-violet" />
                </span>
                <p className="mt-3 text-xs font-semibold text-foreground">
                  Confidential Verification
                </p>
                <ul className="mt-3 flex flex-col gap-1.5 text-left">
                  {shielded.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-1.5 text-[11px] leading-tight text-muted-foreground"
                    >
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-violet" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <FlowArrow />
            </div>
          </div>

          {/* Public proof output */}
          <div className="rounded-xl border border-green/30 bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle">
                Public proof output
              </p>
              <span className="flex items-center gap-1 rounded-full border border-green/40 bg-green/10 px-2 py-0.5 text-[10px] font-semibold text-green">
                <CircleCheck className="h-3 w-3" /> Verified
              </span>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <Row label="Reserve status" value="Verified" valueClass="text-green" />
              <Row label="Threshold" value="Met" valueClass="text-green" />
              <Row
                label="Proof hash"
                value="0x92A7...F13C"
                mono
                icon={<Hash className="h-3 w-3 text-subtle" />}
              />
              <Row
                label="Last verified"
                value="2 mins ago"
                icon={<Clock className="h-3 w-3 text-subtle" />}
              />
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-lg border border-border/70 bg-elevated px-3 py-2 text-[11px] font-medium text-cyan">
              <Link2 className="h-3.5 w-3.5" />
              On-chain proof published
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  valueClass = 'text-foreground',
  mono,
  icon,
}: {
  label: string
  value: string
  valueClass?: string
  mono?: boolean
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={`flex items-center gap-1.5 font-medium ${mono ? 'font-mono' : ''} ${valueClass}`}>
        {icon}
        {value}
      </span>
    </div>
  )
}

function FlowArrow() {
  return (
    <div className="flex items-center justify-center lg:h-4">
      <svg
        width="16"
        height="28"
        viewBox="0 0 16 28"
        fill="none"
        aria-hidden="true"
        className="rotate-90 text-border lg:rotate-0"
      >
        <path
          d="M8 0v20m0 0-5-5m5 5 5-5"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
