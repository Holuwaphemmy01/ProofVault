import { Layers, EyeOff, ShieldAlert } from '@/components/icons'

const blocks = [
  {
    icon: Layers,
    title: 'Reserves are scattered',
    text: 'Projects hold value across multiple chains, wallets, and assets.',
  },
  {
    icon: EyeOff,
    title: 'Transparency can leak strategy',
    text: 'Public wallet disclosure can expose balances, fund movement, and treasury behaviour.',
  },
  {
    icon: ShieldAlert,
    title: 'Users still need proof',
    text: 'Screenshots and claims are not enough when user funds are at risk.',
  },
]

export function ProblemSection() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan">
            The problem
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
            Proof-of-reserves has a privacy problem.
          </h2>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {blocks.map((block) => (
            <div key={block.title} className="bg-card p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-elevated">
                <block.icon className="h-5 w-5 text-muted-foreground" />
              </span>
              <h3 className="mt-6 font-heading text-lg font-semibold text-foreground">
                {block.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {block.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
