import { cn } from "@/lib/utils"

type Tone = "green" | "amber" | "red" | "violet" | "cyan"

const tones: Record<Tone, string> = {
  green: "border-green/30 bg-green/10 text-green",
  amber: "border-amber/30 bg-amber/10 text-amber",
  red: "border-red/30 bg-red/10 text-red",
  violet: "border-violet/30 bg-violet/10 text-violet",
  cyan: "border-primary/30 bg-primary/10 text-primary",
}

export function StatusBadge({
  tone,
  children,
  dot = false,
  className,
}: {
  tone: Tone
  children: React.ReactNode
  dot?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
