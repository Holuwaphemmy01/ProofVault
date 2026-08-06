import { ArrowRight } from '@/components/icons'

export function FinalCta() {
  return (
    <section id="create" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center sm:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(to right, #243044 1px, transparent 1px), linear-gradient(to bottom, #243044 1px, transparent 1px)',
              backgroundSize: '48px 48px',
              maskImage:
                'radial-gradient(ellipse 70% 80% at 50% 50%, #000 20%, transparent 80%)',
            }}
          />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
              Turn reserve claims into verifiable proof.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground text-pretty">
              Launch a confidential proof-of-reserves flow for your project in
              minutes.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="#create"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-cyan px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Create Reserve Proof
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#verify"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-elevated px-6 text-sm font-semibold text-foreground transition-colors hover:bg-navy"
              >
                Verify a Project
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
