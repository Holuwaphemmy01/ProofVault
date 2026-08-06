import { Check } from "@/components/icons"
import { cn } from "@/lib/utils"

const steps = [
  { n: 1, label: "Proof Details" },
  { n: 2, label: "Reserve Wallets" },
  { n: 3, label: "Private Verification" },
  { n: 4, label: "Proof Result" },
]

export function Stepper({ current }: { current: number }) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4">
      <ol className="flex items-center">
        {steps.map((step, i) => {
          const isDone = step.n < current
          const isActive = step.n === current
          return (
            <li key={step.n} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                    isActive && "border-primary bg-primary/15 text-primary",
                    isDone && "border-green bg-green/15 text-green",
                    !isActive && !isDone && "border-border bg-elevated text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" strokeWidth={2.5} /> : step.n}
                </span>
                <span
                  className={cn(
                    "hidden text-sm font-medium sm:block",
                    isActive && "text-foreground",
                    isDone && "text-muted-foreground",
                    !isActive && !isDone && "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <span
                  className={cn(
                    "mx-4 h-px flex-1",
                    isDone ? "bg-green/40" : "bg-border",
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
