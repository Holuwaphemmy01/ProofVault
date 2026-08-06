import { Plus, Wallet, Globe, Download } from "@/components/icons"

const actions = [
  { label: "Add Reserve Source", icon: Wallet },
  { label: "View Public Proof Page", icon: Globe },
  { label: "Export Proof Summary", icon: Download },
]

export function QuickActions() {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="font-heading text-lg font-semibold text-foreground">Quick Actions</h2>
      <div className="mt-4 space-y-3">
        <button className="flex w-full items-center gap-3 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus className="h-[18px] w-[18px]" strokeWidth={2.25} />
          Create New Proof
        </button>
        {actions.map((a) => {
          const Icon = a.icon
          return (
            <button
              key={a.label}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-elevated px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {a.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}
