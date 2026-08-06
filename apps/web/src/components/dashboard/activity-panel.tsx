import { Check } from "@/components/icons"

const steps = [
  { label: "Wallet sources encrypted", confidential: true },
  { label: "Reserve threshold calculated privately", confidential: true },
  { label: "Proof hash generated", confidential: false },
  { label: "On-chain proof published", confidential: false },
]

export function ActivityPanel() {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="font-heading text-lg font-semibold text-foreground">
        Confidential Verification Activity
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Private compute steps completed for the latest proof.
      </p>

      <ol className="mt-6 space-y-1">
        {steps.map((s, i) => (
          <li key={s.label} className="relative flex gap-4 pb-6 last:pb-0">
            {i !== steps.length - 1 && (
              <span className="absolute left-[13px] top-7 h-full w-px bg-border" />
            )}
            <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-green/30 bg-green/10">
              <Check className="h-4 w-4 text-green" strokeWidth={2.5} />
            </span>
            <div className="pt-0.5">
              <p className="text-sm font-medium text-foreground">{s.label}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs font-medium text-green">Complete</span>
                {s.confidential && (
                  <span className="rounded border border-violet/30 bg-violet/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-violet">
                    Confidential
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
