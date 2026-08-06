import { ArrowRight } from '@/components/icons'

const steps = [
  {
    num: '01',
    title: 'Submit reserve sources',
    text: 'Projects provide supported assets and reserve sources.',
  },
  {
    num: '02',
    title: 'Verify privately',
    text: 'ProofVault checks reserve thresholds without exposing sensitive treasury details.',
  },
  {
    num: '03',
    title: 'Publish proof',
    text: 'Users see a verified status, proof hash, timestamp, and on-chain record.',
  },
]

export function SolutionSection() {
  return (
    <section className="border-b border-border bg-navy/40">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan">
            The solution
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
            One private calculation. One public result.
          </h2>
        </div>

        <div className="mt-14 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {steps.map((step, i) => (
            <div key={step.num} className="contents">
              <div className="rounded-2xl border border-border bg-card p-8">
                <span className="font-mono text-sm font-semibold text-cyan">
                  {step.num}
                </span>
                <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-5 w-5 rotate-90 text-subtle md:rotate-0" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
