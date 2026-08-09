import Link from "next/link";
import { BadgeEmbedPanel } from "@/components/proof/badge-embed-panel";
import { VerificationBadge } from "@/components/proof/verification-badge";
import {
  badgeCopy,
  getPublicAppUrl,
  getVerifiedAt,
  isValidProjectSlug,
  LatestProofResponse,
  normalizeBadgeStatus,
  VerificationBadgeStatus,
} from "@/lib/proof-badge";

async function getLatestProof(slug: string): Promise<LatestProofResponse | null> {
  if (!isValidProjectSlug(slug)) {
    return null;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/public/projects/${slug}/latest-proof`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as LatestProofResponse;
  } catch {
    return null;
  }
}

export default async function BadgePreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const latestProof = await getLatestProof(slug);
  const status: VerificationBadgeStatus = latestProof ? normalizeBadgeStatus(latestProof.proofResult) : "EXPIRED";
  const projectName = latestProof?.project?.name ?? slug;
  const verifiedAt = getVerifiedAt(latestProof?.proofResult);
  const appUrl = getPublicAppUrl();

  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-sm font-semibold tracking-wide text-foreground">
          ProofVault
        </Link>
        <Link href={`/verify/${slug}`} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          View verifier
        </Link>
      </header>

      <section className="mx-auto max-w-5xl py-14">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Embeddable badge</p>
        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Preview the ProofVault badge.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          Projects can place this compact badge in a footer, trust page, or product page to link
          visitors back to the public ProofVault verifier.
        </p>

        <section className="mt-10 rounded-2xl border border-border bg-card p-8">
          <h2 className="font-heading text-2xl font-semibold text-foreground">Badge Preview</h2>
          <div className="mt-6">
            <VerificationBadge
              projectSlug={slug}
              projectName={projectName}
              status={status}
              verifiedAt={verifiedAt}
            />
          </div>
          {!latestProof ? (
            <p className="mt-5 rounded-lg bg-elevated px-4 py-3 text-sm text-muted-foreground">
              No active public proof was found. The embeddable SVG will show a neutral ProofVault
              status until a proof is available.
            </p>
          ) : null}
        </section>

        <div className="mt-8">
          <BadgeEmbedPanel
            projectName={projectName}
            projectSlug={slug}
            appUrl={appUrl}
            statusLabel={badgeCopy[status].label}
          />
        </div>
      </section>
    </main>
  );
}
