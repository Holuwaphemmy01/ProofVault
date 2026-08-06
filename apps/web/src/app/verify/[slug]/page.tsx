import { PublicProofResult } from "@/components/verification/public-proof-result";

export default async function VerifyProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <PublicProofResult slug={slug} />;
}
