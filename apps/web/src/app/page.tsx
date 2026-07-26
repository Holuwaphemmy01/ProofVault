export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617] px-6 py-10 text-[#F8FAFC]">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center">
        <div className="w-full rounded-lg border border-white/10 bg-[#101827] p-8 shadow-2xl shadow-cyan-950/20 sm:p-12">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[#22D3EE]">
            Built for Flare
          </p>
          <h1 className="text-4xl font-semibold sm:text-6xl">ProofVault</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#94A3B8]">
            Confidential cross-chain proof-of-reserves platform
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button className="rounded-md bg-[#22D3EE] px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
              Create Reserve Proof
            </button>
            <button className="rounded-md border border-[#8B5CF6]/70 px-5 py-3 font-semibold text-[#F8FAFC] transition hover:border-[#10B981] hover:text-[#10B981]">
              Verify a Project
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
