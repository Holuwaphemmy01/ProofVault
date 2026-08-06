import { SiteNav } from "@/components/landing/site-nav";
import { VerificationPreview } from "@/components/landing/verification-preview";
import { SiteFooter } from "@/components/landing/site-footer";
import { PrivacyExplainer } from "@/components/shared/privacy-explainer";

export default function PublicVerifierPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="pt-10">
        <VerificationPreview />
        <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <PrivacyExplainer />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
