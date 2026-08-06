import { Sidebar } from "@/components/dashboard/sidebar";
import { ProofTopbar } from "@/components/proof/proof-topbar";
import { Stepper } from "@/components/proof/stepper";
import { ReserveHealth } from "@/components/dashboard/reserve-health";
import { ActivityPanel } from "@/components/dashboard/activity-panel";

export default function ProofStatusPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeItem="Proof Requests" />
      <div className="flex min-w-0 flex-1 flex-col">
        <ProofTopbar
          title="Proof Status"
          subtitle="Follow the private verification lifecycle from encrypted request to public proof result."
        />
        <main className="flex-1 px-6 py-6 lg:px-8">
          <Stepper current={3} />
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
            <ReserveHealth />
            <ActivityPanel />
          </div>
        </main>
      </div>
    </div>
  );
}
