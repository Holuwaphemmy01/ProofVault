import { Layers, CheckCircle2, Clock, XCircle } from "@/components/icons"
import { cn } from "@/lib/utils"

const metrics = [
  {
    title: "Total Proofs",
    value: "12",
    subtitle: "All reserve proof requests",
    icon: Layers,
    accent: "text-foreground",
    ring: "border-border bg-elevated",
  },
  {
    title: "Passed",
    value: "9",
    subtitle: "Threshold met",
    icon: CheckCircle2,
    accent: "text-green",
    ring: "border-green/30 bg-green/10",
  },
  {
    title: "Pending",
    value: "2",
    subtitle: "Awaiting verification",
    icon: Clock,
    accent: "text-amber",
    ring: "border-amber/30 bg-amber/10",
  },
  {
    title: "Failed",
    value: "1",
    subtitle: "Threshold not met",
    icon: XCircle,
    accent: "text-red",
    ring: "border-red/30 bg-red/10",
  },
]

export function MetricCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((m) => {
        const Icon = m.icon
        return (
          <div key={m.title} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{m.title}</p>
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg border",
                  m.ring,
                )}
              >
                <Icon className={cn("h-[18px] w-[18px]", m.accent)} strokeWidth={1.75} />
              </div>
            </div>
            <p className={cn("mt-4 font-heading text-3xl font-bold", m.accent)}>{m.value}</p>
            <p className="mt-1 text-xs text-subtle">{m.subtitle}</p>
          </div>
        )
      })}
    </div>
  )
}
