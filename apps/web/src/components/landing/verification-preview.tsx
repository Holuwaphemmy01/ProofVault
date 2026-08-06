import { CircleCheck, ExternalLink, ShieldCheck } from '@/components/icons'

const assets = ['BTC', 'XRP', 'DOGE', 'FLR', 'USDC']

export function VerificationPreview() {
  return (
    <section id="verify" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan">
            Public verification
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
            Simple enough for users. Strong enough for protocols.
          </h2>
        </div>

        <div className="mx-auto mt-14 max-w-xl">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/40">
            {/* certificate header */}
            <div className="flex items-center justify-between border-b border-border bg-navy/60 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-elevated">
                  <ShieldCheck className="h-5 w-5 text-cyan" />
                </span>
                <div>
                  <p className="font-heading text-base font-semibold text-foreground">
                    AtlasX Exchange
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reserve Verification Certificate
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 rounded-full border border-green/40 bg-green/10 px-3 py-1 text-xs font-semibold text-green">
                <CircleCheck className="h-3.5 w-3.5" />
                Reserve Verified
              </span>
            </div>

            {/* body */}
            <div className="divide-y divide-border px-6">
              <Field label="Result" value="Threshold Met" valueClass="text-green" />
              <div className="flex items-center justify-between py-3.5">
                <span className="text-sm text-muted-foreground">Assets</span>
                <div className="flex flex-wrap justify-end gap-1.5">
                  {assets.map((a) => (
                    <span
                      key={a}
                      className="rounded-md border border-border bg-elevated px-2 py-0.5 font-mono text-[11px] text-foreground"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
              <Field label="Proof Hash" value="0x92A7...F13C" mono />
              <Field label="Timestamp" value="21 July 2026, 14:32 UTC" />
              <Field
                label="Verification Mode"
                value="Confidential"
                valueClass="text-violet"
              />
            </div>

            {/* footer action */}
            <div className="border-t border-border bg-navy/60 p-4">
              <a
                href="#proof"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-elevated text-sm font-semibold text-foreground transition-colors hover:border-cyan/50 hover:text-cyan"
              >
                View On-Chain Proof
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Field({
  label,
  value,
  valueClass = 'text-foreground',
  mono,
}: {
  label: string
  value: string
  valueClass?: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`text-sm font-medium ${mono ? 'font-mono' : ''} ${valueClass}`}
      >
        {value}
      </span>
    </div>
  )
}
