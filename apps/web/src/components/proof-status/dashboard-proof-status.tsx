"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { getLifecycleStatus, StatusBadge } from "./status-badge";

type ProjectProofRequestsResponse = {
  proofRequests: Record<string, unknown>[];
};

export function DashboardProofStatus({ projectSlug = "atlasx-exchange" }: { projectSlug?: string }) {
  const [proofRequests, setProofRequests] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchProjectProofs() {
      try {
        const response = await api.get<ProjectProofRequestsResponse>(`/projects/${projectSlug}/proof-requests`, {
          cache: "no-store",
        });

        if (!mounted) {
          return;
        }

        setProofRequests(response.proofRequests);
        setError("");
        setLastUpdatedAt(new Date().toLocaleTimeString());
      } catch (requestError) {
        if (!mounted) {
          return;
        }

        setError(requestError instanceof Error ? requestError.message : "Unable to load project proof status.");
      }
    }

    fetchProjectProofs();
    const interval = window.setInterval(fetchProjectProofs, 5000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [projectSlug]);

  const latestProof = proofRequests[0];
  const status = useMemo(() => getLifecycleStatus(latestProof), [latestProof]);
  const proofId = String(latestProof?.id ?? "demo-proof-001");

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">Live Proof Status</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {latestProof ? String(latestProof.proofName ?? "Latest reserve proof") : "Waiting for latest proof request"}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-6">
        <p className={`font-heading text-4xl font-bold leading-none ${status === "PASSED" ? "text-green" : status === "FAILED" ? "text-red" : status === "VERIFYING" ? "text-primary" : "text-amber"}`}>
          {status}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          {lastUpdatedAt ? `Updated ${lastUpdatedAt}` : "Refreshes every 5 seconds"}
        </p>
      </div>

      {error ? <p className="mt-4 rounded-lg bg-red/10 px-3 py-2 text-sm text-red">{error}</p> : null}

      <Link
        href={`/proof/${proofId}`}
        className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        View proof lifecycle
      </Link>
    </section>
  );
}
