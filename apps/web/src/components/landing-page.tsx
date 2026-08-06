import Link from "next/link";
import { AppFrame, AssetRail, Eyebrow, Metric, ReserveVisual, StatusPill } from "./proofvault-ui";

export function LandingPage() {
  return (
    <AppFrame>
      <section className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl items-center gap-10 px-6 pb-20 pt-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Eyebrow>Confidential proof of reserves</Eyebrow>
          <h1 className="mt-6 max-w-5xl text-6xl font-semibold leading-[1.02] tracking-normal text-white md:text-8xl">
            Prove reserves without revealing the vault.
          </h1>
          <p className="mt-7 max-w-2xl text-xl leading-9 text-slate-400">
            ProofVault lets exchanges, DAOs, bridges, and asset-backed protocols publish verified reserve health across Flare FAssets and native assets while keeping treasury composition private.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/create-proof" className="rounded-md bg-blue-500 px-5 py-3 text-center font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-400">
              Create proof
            </Link>
            <Link href="/public-verifier" className="rounded-md bg-white/[0.06] px-5 py-3 text-center font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/[0.09]">
              Verify project
            </Link>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <Metric label="Assets" value="5" detail="FAssets + FLR" />
            <Metric label="Privacy" value="Zero leaks" detail="No exact balances" />
            <Metric label="Anchor" value="On-chain" detail="Public proof hash" />
          </div>
        </div>
        <div className="rounded-lg bg-white/[0.035] p-6 ring-1 ring-white/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">AtlasX Exchange</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Reserve proof</h2>
            </div>
            <StatusPill status="PASS" />
          </div>
          <p className="mt-5 max-w-md leading-7 text-slate-400">
            Public verification shows the outcome, commitments, and signer without exposing where funds are held.
          </p>
          <div className="mt-8">
            <ReserveVisual />
          </div>
          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500">Supported reserves</p>
            <AssetRail />
          </div>
        </div>
      </section>
    </AppFrame>
  );
}
