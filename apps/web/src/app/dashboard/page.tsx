import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { MetricCards } from "@/components/dashboard/metric-cards";
import { ReserveHealth } from "@/components/dashboard/reserve-health";
import { ProofsTable } from "@/components/dashboard/proofs-table";
import { ActivityPanel } from "@/components/dashboard/activity-panel";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { DashboardProofStatus } from "@/components/proof-status/dashboard-proof-status";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 space-y-6 p-6 lg:p-8">
          <ProfileCard />
          <MetricCards />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
              <ReserveHealth />
              <ProofsTable />
            </div>
            <div className="space-y-6">
              <DashboardProofStatus />
              <ActivityPanel />
              <QuickActions />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
