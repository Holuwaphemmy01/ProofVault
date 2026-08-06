import { Sidebar } from "@/components/dashboard/sidebar";
import { ProofTopbar } from "@/components/proof/proof-topbar";
import { Stepper } from "@/components/proof/stepper";
import { ProofForm } from "@/components/proof/proof-form";
import { PrivacyMode } from "@/components/proof/privacy-mode";
import { ProofSummary } from "@/components/proof/proof-summary";
import { ActionBar } from "@/components/proof/action-bar";

export default function CreateProofPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeItem="Proof Requests" />
      <div className="flex min-w-0 flex-1 flex-col">
        <ProofTopbar
          title="Create Reserve Proof"
          subtitle="Define the reserve threshold and privacy settings for a new proof-of-reserves request."
        />

        <main className="flex-1 px-6 py-6 lg:px-8">
          <Stepper current={1} />

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <ProofForm />
              <PrivacyMode />
              <ActionBar />
            </div>
            <ProofSummary />
          </div>
        </main>
      </div>
    </div>
  );
}
