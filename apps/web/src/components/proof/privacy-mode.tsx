import { ShieldCheck, EyeOff, Eye } from "@/components/icons"
import { cn } from "@/lib/utils"

const options = [
  {
    icon: ShieldCheck,
    title: "Confidential Threshold Proof",
    description:
      "Public users see only whether the threshold was met, proof hash, timestamp, and on-chain record.",
    badge: "Recommended",
    selected: true,
  },
  {
    icon: EyeOff,
    title: "Partial Disclosure",
    description:
      "Show supported asset categories while hiding exact wallet balances and treasury strategy.",
    selected: false,
  },
  {
    icon: Eye,
    title: "Public Reserve Snapshot",
    description: "Expose more reserve information for maximum transparency.",
    selected: false,
  },
]

export function PrivacyMode() {
  return (
    <section className="rounded-xl border border-violet/25 bg-violet/[0.04] p-6 lg:p-7">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet/30 bg-violet/10">
          <ShieldCheck className="h-4 w-4 text-violet" strokeWidth={1.75} />
        </span>
        <h2 className="font-heading text-lg font-bold text-foreground">Privacy Mode</h2>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Choose how much reserve information remains hidden from public verification.
      </p>

      <div className="mt-5 space-y-3">
        {options.map((opt) => {
          const Icon = opt.icon
          return (
            <button
              key={opt.title}
              type="button"
              className={cn(
                "flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors",
                opt.selected
                  ? "border-violet/60 bg-violet/10"
                  : "border-border bg-elevated hover:border-violet/30",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                  opt.selected ? "border-violet/40 bg-violet/15 text-violet" : "border-border bg-card text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{opt.title}</span>
                  {opt.badge && (
                    <span className="rounded-full border border-violet/30 bg-violet/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet">
                      {opt.badge}
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{opt.description}</span>
              </span>
              <span
                className={cn(
                  "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                  opt.selected ? "border-violet" : "border-border",
                )}
              >
                {opt.selected && <span className="h-2.5 w-2.5 rounded-full bg-violet" />}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
