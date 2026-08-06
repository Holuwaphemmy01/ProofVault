import { ArrowRight, ShieldCheck } from '@/components/icons'
import { ProofEngine } from './proof-engine'

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border" id="product">
      {/* subtle grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #243044 1px, transparent 1px), linear-gradient(to bottom, #243044 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)',
        }}
      />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-8 lg:px-8 lg:py-28">
        {/* Left */}
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan" />
            Confidential reserve verification for Flare builders
          </span>

          <h1 className="mt-6 font-heading text-4xl font-bold leading-[1.05] tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl">
            Prove reserves without opening the vault.
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
            ProofVault helps crypto organizations verify cross-chain reserves
            across BTC, XRP, DOGE, FLR, stablecoins, and FAssets while keeping
            sensitive treasury data confidential.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#create"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-cyan px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Create Reserve Proof
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#verify"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:bg-elevated"
            >
              Verify a Project
            </a>
          </div>

          <p className="mt-6 text-sm text-subtle">
            Built for exchanges, DAOs, bridges, lending protocols, and
            asset-backed protocols.
          </p>
        </div>

        {/* Right visual */}
        <div id="proof-engine" className="relative">
          <ProofEngine />
        </div>
      </div>
    </section>
  )
}
