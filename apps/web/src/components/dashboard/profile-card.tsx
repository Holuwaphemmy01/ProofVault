import { ShieldCheck, EyeOff } from "@/components/icons"
import { StatusBadge } from "@/components/dashboard/status-badge"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-subtle">{label}</p>
      <div className="mt-1.5 text-sm font-semibold text-foreground">{children}</div>
    </div>
  )
}

export function ProfileCard() {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" strokeWidth={1.75} />
          </div>
          <div className="grid grid-cols-2 gap-x-10 gap-y-4 sm:grid-cols-3 xl:grid-cols-5">
            <Field label="Company">AtlasX Exchange</Field>
            <Field label="Project Type">Exchange</Field>
            <Field label="Verification Mode">
              <StatusBadge tone="violet">Confidential</StatusBadge>
            </Field>
            <Field label="Reserve Status">
              <StatusBadge tone="green" dot>
                Reserve Verified
              </StatusBadge>
            </Field>
            <Field label="Last Verified">
              <span className="text-primary">2 mins ago</span>
            </Field>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
        <EyeOff className="h-4 w-4 text-violet" strokeWidth={1.75} />
        Sensitive wallet balances remain hidden. Only the final proof status is published.
      </div>
    </section>
  )
}
