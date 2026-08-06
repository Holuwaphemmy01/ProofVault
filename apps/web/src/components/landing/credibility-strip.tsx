const pills = [
  'Cross-chain reserves',
  'Confidential verification',
  'On-chain proof',
  'Treasury privacy',
  'Public verification',
]

export function CredibilityStrip() {
  return (
    <section className="border-b border-border bg-navy/40">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-6 py-6 lg:px-8">
        {pills.map((pill) => (
          <span
            key={pill}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
            {pill}
          </span>
        ))}
      </div>
    </section>
  )
}
