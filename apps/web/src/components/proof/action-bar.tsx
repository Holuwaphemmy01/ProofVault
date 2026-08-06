import { ArrowRight } from "@/components/icons"

export function ActionBar({
  backLabel = "Cancel",
  primaryLabel = "Continue to Reserve Wallets",
}: {
  backLabel?: string
  primaryLabel?: string
}) {
  return (
    <div className="flex flex-col-reverse items-stretch gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        className="rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {backLabel}
      </button>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="rounded-lg border border-border bg-elevated px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
        >
          Save Draft
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {primaryLabel}
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
