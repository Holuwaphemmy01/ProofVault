import { Building2, Users, Waypoints, Landmark, Coins, Boxes } from '@/components/icons'

const cases = [
  {
    icon: Building2,
    title: 'Exchanges',
    text: 'Prove customer deposits are fully backed.',
  },
  {
    icon: Users,
    title: 'DAOs',
    text: 'Show treasury health without doxxing wallets.',
  },
  {
    icon: Waypoints,
    title: 'Bridges',
    text: 'Verify locked collateral across chains.',
  },
  {
    icon: Landmark,
    title: 'Lending Protocols',
    text: 'Confirm solvency and collateral ratios.',
  },
  {
    icon: Coins,
    title: 'Stablecoin Issuers',
    text: 'Attest reserves back every token in circulation.',
  },
  {
    icon: Boxes,
    title: 'Asset-backed Tokens',
    text: 'Prove real backing for tokenized assets.',
  },
]

export function UseCases() {
  return (
    <section id="use-cases" className="border-b border-border bg-navy/40">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan">
            Use cases
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
            Built for institutions that hold user trust.
          </h2>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <div
              key={c.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-cyan/40"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-elevated">
                <c.icon className="h-5 w-5 text-cyan" />
              </span>
              <h3 className="mt-5 font-heading text-base font-semibold text-foreground">
                {c.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {c.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
