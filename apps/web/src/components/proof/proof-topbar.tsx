import { StatusBadge } from "@/components/dashboard/status-badge"
import { Save } from "@/components/icons"

export function ProofTopbar({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-border bg-[#0B1120] px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground text-balance">{title}</h1>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground text-pretty">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2.5">
        <StatusBadge tone="cyan" dot>
          Flare
        </StatusBadge>
        <StatusBadge tone="green" dot>
          Connected
        </StatusBadge>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-elevated px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <Save className="h-3.5 w-3.5" strokeWidth={1.75} />
          Save Draft
        </button>
      </div>
    </header>
  )
}
