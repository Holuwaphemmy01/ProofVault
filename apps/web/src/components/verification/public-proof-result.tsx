"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PrivacyExplainer } from "@/components/shared/privacy-explainer";
import { api } from "@/lib/api";

type PublicProofResponse = {
  project: {
    name: string;
    slug: string;
    projectType: string;
  };
  proofResult: {
    outcome?: "PASS" | "FAIL";
    status?: "PASS" | "FAIL";
    thresholdMet?: boolean;
    proofHash?: string;
    signature?: string;
    workerSignedAt?: string | number;
    submittedAt?: string;
    timestamp?: string;
    verifiedWith?: string[];
    receipt?: {
      proof?: {
        verifiedAt?: string;
        status?: "PASS" | "FAIL";
        thresholdMet?: boolean;
      };
      verification?: {
        worker?: {
          signature?: string;
        };
      };
      commitments?: {
        proofHash?: string;
      };
    };
  };
};

export function PublicProofResult({ slug }: { slug: string }) {
  const [data, setData] = useState<PublicProofResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchLatestProof() {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.get<PublicProofResponse>(`/public/projects/${slug}/latest-proof`, {
          cache: "no-store",
        });

        if (mounted) {
          setData(response);
        }
      } catch {
        if (mounted) {
          setError("Project not found or no public proof is available yet.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchLatestProof();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const proof = data?.proofResult;
  const outcome = useMemo(() => getOutcome(proof), [proof]);
  const proofHash = proof?.proofHash ?? proof?.receipt?.commitments?.proofHash ?? "Not available";
  const signature = proof?.signature ?? proof?.receipt?.verification?.worker?.signature ?? "Not available";
  const timestamp = getTimestamp(proof);
  const verifiedWith = proof?.verifiedWith?.length ? proof.verifiedWith : ["Confidential compute", "Proof hash", "Worker signature"];

  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-sm font-semibold tracking-wide text-foreground">
          ProofVault
        </Link>
        <Link href="/verify" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          Search
        </Link>
      </header>

      <section className="mx-auto max-w-5xl py-16">
        {isLoading ? (
          <div className="flex min-h-[28rem] flex-col items-center justify-center text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-5 text-sm text-muted-foreground">Loading latest public proof...</p>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-red">Verification unavailable</p>
            <h1 className="mt-4 font-heading text-4xl font-bold text-foreground">Project not found</h1>
            <p className="mt-4 leading-7 text-muted-foreground">{error}</p>
            <Link
              href="/verify"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Search another project
            </Link>
          </div>
        ) : data ? (
          <div className="space-y-10">
            <section className="text-center">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Public reserve proof</p>
              <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {data.project.name}
              </h1>
              <div className={`mt-10 font-heading text-8xl font-bold leading-none ${outcome === "PASS" ? "text-green" : "text-red"}`}>
                {outcome}
              </div>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                This proof shows whether the project&apos;s reserve threshold was met. Wallet addresses
                and exact balances are not public.
              </p>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <SummaryItem label="Threshold" value={proof?.thresholdMet ? "Met" : "Not met"} />
              <SummaryItem label="Timestamp" value={timestamp} />
              <SummaryItem label="Project type" value={data.project.projectType} />
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-heading text-2xl font-semibold text-foreground">Verification indicators</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {verifiedWith.map((indicator) => (
                  <div key={indicator} className="rounded-xl bg-elevated p-4">
                    <span className="text-primary">✓</span>
                    <p className="mt-2 text-sm font-medium text-foreground">{formatIndicator(indicator)}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <ProofData label="Proof hash" value={proofHash} />
              <ProofData label="Signature" value={signature} />
            </section>

            <PrivacyExplainer />
          </div>
        ) : null}
      </section>
    </main>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ProofData({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 break-all font-mono text-sm leading-6 text-foreground">{value}</p>
    </div>
  );
}

function getOutcome(proof: PublicProofResponse["proofResult"] | undefined) {
  const outcome = proof?.outcome ?? proof?.status ?? proof?.receipt?.proof?.status;

  return outcome === "FAIL" ? "FAIL" : "PASS";
}

function getTimestamp(proof: PublicProofResponse["proofResult"] | undefined) {
  const timestamp = proof?.receipt?.proof?.verifiedAt ?? proof?.workerSignedAt ?? proof?.submittedAt ?? proof?.timestamp;

  if (!timestamp) {
    return "Not available";
  }

  if (typeof timestamp === "number") {
    return new Date(timestamp * 1000).toLocaleString();
  }

  return new Date(timestamp).toLocaleString();
}

function formatIndicator(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase());
}
