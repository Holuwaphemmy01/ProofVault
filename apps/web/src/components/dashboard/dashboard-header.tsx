import { Plus } from "@/components/icons"
import { StatusBadge } from "@/components/dashboard/status-badge"

export function DashboardHeader() {
  return (
    <header className="flex flex-col gap-4 border-b border-border bg-navy/40 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          Company Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor reserve proof activity and create confidential verification requests.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge tone="cyan" dot>
          Flare
        </StatusBadge>
        <StatusBadge tone="green" dot>
          Connected
        </StatusBadge>
        <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus className="h-4 w-4" strokeWidth={2.25} />
          Create New Proof
        </button>
      </div>
    </header>
  )
}
