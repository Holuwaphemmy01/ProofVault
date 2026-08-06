"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { getLifecycleStatus, ProofLifecycleStatus, StatusBadge } from "./status-badge";

type ProofRequestResponse = {
  proofRequest: Record<string, unknown>;
};

const lifecycleSteps: ProofLifecycleStatus[] = ["PENDING", "VERIFYING", "PASSED"];

export function ProofStatusView({ proofId }: { proofId: string }) {
  const [proofRequest, setProofRequest] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchProofStatus() {
      try {
        const response = await api.get<ProofRequestResponse>(`/proof-requests/${proofId}`, {
          cache: "no-store",
        });

        if (!mounted) {
          return;
        }

        setProofRequest(response.proofRequest);
        setError("");
        setLastUpdatedAt(new Date().toLocaleTimeString());
      } catch (requestError) {
        if (!mounted) {
          return;
        }

        setError(requestError instanceof Error ? requestError.message : "Unable to load proof status.");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProofStatus();
    const interval = window.setInterval(fetchProofStatus, 4000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [proofId]);

  const status = useMemo(() => getLifecycleStatus(proofRequest), [proofRequest]);
  const selectedAssets = Array.isArray(proofRequest?.selectedAssets)
    ? (proofRequest.selectedAssets as string[])
    : ["FXRP", "FBTC"];

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
      <section className="rounded-2xl border border-border bg-card p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Proof lifecycle</p>
            <h1 className={`mt-4 font-heading text-6xl font-bold leading-none ${getStatusTextColor(status)}`}>
              {isLoading ? "LOADING" : status}
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">Proof request ID: {proofId}</p>
          </div>
          <StatusBadge status={status} large />
        </div>

        {error ? <p className="mt-6 rounded-lg bg-red/10 px-4 py-3 text-sm text-red">{error}</p> : null}

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {lifecycleSteps.map((step, index) => {
            const active = getStepState(step, status);

            return (
              <div key={step} className="rounded-xl bg-elevated p-5">
                <p className="text-sm font-semibold text-primary">0{index + 1}</p>
                <p className="mt-3 text-lg font-semibold text-foreground">{step}</p>
                <p className="mt-2 text-sm text-muted-foreground">{active}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Detail label="Project slug" value={String(proofRequest?.projectSlug ?? "atlasx-exchange")} />
          <Detail label="Proof name" value={String(proofRequest?.proofName ?? "Reserve verification")} />
          <Detail label="Threshold commitment" value={String(proofRequest?.thresholdCommitment ?? "Pending")} mono />
          <Detail label="Last refreshed" value={lastUpdatedAt || "Waiting for first refresh"} />
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <p className="text-sm font-medium text-muted-foreground">Selected assets</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedAssets.map((asset) => (
              <span key={asset} className="rounded-md border border-border bg-elevated px-3 py-1.5 text-sm text-foreground">
                {asset}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-elevated p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-2 break-words text-lg font-semibold text-foreground ${mono ? "font-mono text-sm" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function getStatusTextColor(status: ProofLifecycleStatus) {
  const colors: Record<ProofLifecycleStatus, string> = {
    PENDING: "text-amber",
    VERIFYING: "text-primary",
    PASSED: "text-green",
    FAILED: "text-red",
    EXPIRED: "text-muted-foreground",
  };

  return colors[status];
}

function getStepState(step: ProofLifecycleStatus, status: ProofLifecycleStatus) {
  if (status === "FAILED" || status === "EXPIRED") {
    return step === "PASSED" ? "Stopped" : "Completed";
  }

  const statusIndex = lifecycleSteps.indexOf(status);
  const stepIndex = lifecycleSteps.indexOf(step);

  if (stepIndex < statusIndex) {
    return "Completed";
  }

  if (stepIndex === statusIndex) {
    return status === "VERIFYING" ? "Refreshing every 4 seconds" : "Current";
  }

  return "Waiting";
}
