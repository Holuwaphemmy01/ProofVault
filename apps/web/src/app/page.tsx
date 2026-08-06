import { SiteNav } from "@/components/landing/site-nav";
import { Hero } from "@/components/landing/hero";
import { CredibilityStrip } from "@/components/landing/credibility-strip";
import { ProblemSection } from "@/components/landing/problem-section";
import { SolutionSection } from "@/components/landing/solution-section";
import { VerificationPreview } from "@/components/landing/verification-preview";
import { UseCases } from "@/components/landing/use-cases";
import { FinalCta } from "@/components/landing/final-cta";
import { SiteFooter } from "@/components/landing/site-footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <Hero />
        <CredibilityStrip />
        <ProblemSection />
        <SolutionSection />
        <VerificationPreview />
        <UseCases />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
