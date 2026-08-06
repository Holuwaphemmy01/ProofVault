import { Navbar } from "@/components/layout/navbar";
import { StatusBadge } from "@/components/dashboard/status-badge";

const proof = {
  projectName: "AtlasX Exchange",
  status: "PASS",
  threshold: "$1,000,000 USD",
  assets: ["FBTC", "FXRP", "FLR", "USDX"],
  proofHash: "0x8f42c92d1f3a7b19ad",
  requestId: "demo-proof-001",
  verifiedAt: "August 6, 2026",
};

export default async function ProofPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Proof result</p>
              <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-foreground">
                {proof.projectName}
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">Route proof ID: {id}</p>
            </div>
            <StatusBadge tone="green" dot>
              {proof.status}
            </StatusBadge>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Detail label="Required threshold" value={proof.threshold} />
            <Detail label="Verified at" value={proof.verifiedAt} />
            <Detail label="Request ID" value={proof.requestId} />
            <Detail label="Proof hash" value={proof.proofHash} mono />
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <p className="text-sm font-medium text-muted-foreground">Supported assets</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {proof.assets.map((asset) => (
                <span key={asset} className="rounded-md border border-border bg-elevated px-3 py-1.5 text-sm text-foreground">
                  {asset}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-elevated p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-2 text-lg font-semibold text-foreground ${mono ? "font-mono text-sm" : ""}`}>{value}</p>
    </div>
  );
}
