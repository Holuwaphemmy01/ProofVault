import { Navbar } from "@/components/layout/navbar";
import { VerificationPreview } from "@/components/landing/verification-preview";

export default async function VerifyProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">Public verification</p>
          <h1 className="mt-4 max-w-3xl font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Verify {slug.replaceAll("-", " ")} reserve status.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
            This route uses mock proof data for now and will later read the latest public proof result from the backend.
          </p>
        </section>
        <VerificationPreview />
      </main>
    </div>
  );
}
