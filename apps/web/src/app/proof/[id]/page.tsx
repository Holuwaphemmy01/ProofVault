import { Navbar } from "@/components/layout/navbar";
import { ProofStatusView } from "@/components/proof-status/proof-status-view";

export default async function ProofPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ProofStatusView proofId={id} />
    </div>
  );
}
