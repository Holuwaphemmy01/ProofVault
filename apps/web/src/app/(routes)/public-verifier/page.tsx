import { SiteNav } from "@/components/landing/site-nav";
import { VerificationPreview } from "@/components/landing/verification-preview";
import { SiteFooter } from "@/components/landing/site-footer";

export default function PublicVerifierPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="pt-10">
        <VerificationPreview />
      </main>
      <SiteFooter />
    </div>
  );
}
