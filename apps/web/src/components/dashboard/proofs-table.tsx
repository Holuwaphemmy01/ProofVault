import { StatusBadge } from "@/components/dashboard/status-badge"

type Status = "Passed" | "Pending" | "Failed"

const rows: {
  id: string
  assets: string
  threshold: string
  status: Status
  updated: string
  hash: string
  generating?: boolean
}[] = [
  {
    id: "PV-2401",
    assets: "BTC, XRP, FLR",
    threshold: "$1,000,000",
    status: "Passed",
    updated: "2 mins ago",
    hash: "0x92A7...F13C",
  },
  {
    id: "PV-2400",
    assets: "DOGE, USDC",
    threshold: "$250,000",
    status: "Pending",
    updated: "14 mins ago",
    hash: "Generating",
    generating: true,
  },
  {
    id: "PV-2399",
    assets: "BTC, USDC",
    threshold: "$500,000",
    status: "Passed",
    updated: "Yesterday",
    hash: "0x71BE...A91D",
  },
  {
    id: "PV-2398",
    assets: "XRP, DOGE",
    threshold: "$300,000",
    status: "Failed",
    updated: "2 days ago",
    hash: "0x54CD...882F",
  },
]

const tone: Record<Status, "green" | "amber" | "red"> = {
  Passed: "green",
  Pending: "amber",
  Failed: "red",
}

export function ProofsTable() {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Recent Proof Requests
        </h2>
        <button className="text-xs font-medium text-primary hover:text-primary/80">
          View all
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-subtle">
              <th className="px-6 py-3 font-medium">Proof ID</th>
              <th className="px-6 py-3 font-medium">Asset Group</th>
              <th className="px-6 py-3 font-medium">Threshold</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Last Updated</th>
              <th className="px-6 py-3 font-medium">Proof Hash</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-border/60 text-sm transition-colors last:border-0 hover:bg-elevated/50"
              >
                <td className="px-6 py-4 font-mono font-medium text-foreground">{r.id}</td>
                <td className="px-6 py-4 text-muted-foreground">{r.assets}</td>
                <td className="px-6 py-4 font-medium text-foreground">{r.threshold}</td>
                <td className="px-6 py-4">
                  <StatusBadge tone={tone[r.status]} dot>
                    {r.status}
                  </StatusBadge>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{r.updated}</td>
                <td className="px-6 py-4">
                  {r.generating ? (
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-amber">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" />
                      Generating
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground">{r.hash}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
