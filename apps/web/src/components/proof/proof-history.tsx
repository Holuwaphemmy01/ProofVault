"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { ProofHistoryItem } from "./proof-history-item";

export type ProofHistoryEntry = {
  id: string;
  requestId: string;
  status: "PASS" | "FAIL" | "PENDING" | string;
  thresholdMet: boolean;
  proofHash: string;
  transactionHash?: string | null;
  onChainRequestId?: string | null;
  onChainResultId?: string | null;
  verifiedAt: string;
};

type ProofHistoryResponse = {
  success: boolean;
  projectSlug: string;
  proofs: ProofHistoryEntry[];
};

export function ProofHistory({ projectSlug }: { projectSlug: string }) {
  const [proofs, setProofs] = useState<ProofHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchProofHistory() {
      try {
        const response = await api.get<ProofHistoryResponse>(`/public/projects/${projectSlug}/proof-history`, {
          cache: "no-store",
        });

        if (!mounted) {
          return;
        }

        setProofs(response.proofs);
        setError("");
      } catch {
        if (mounted) {
          setError("Proof history is temporarily unavailable.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProofHistory();

    return () => {
      mounted = false;
    };
  }, [projectSlug]);

  const sortedProofs = useMemo(
    () =>
      [...proofs].sort(
        (left, right) => new Date(right.verifiedAt).getTime() - new Date(left.verifiedAt).getTime(),
      ),
    [proofs],
  );

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold text-foreground">Proof History</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Historical reserve verification results published by ProofVault.
        </p>
      </div>

      {isLoading ? <p className="mt-6 text-sm text-muted-foreground">Loading proof history...</p> : null}
      {error ? <p className="mt-6 rounded-lg bg-elevated px-4 py-3 text-sm text-muted-foreground">{error}</p> : null}

      {!isLoading && !error && sortedProofs.length === 0 ? (
        <p className="mt-6 rounded-lg bg-elevated px-4 py-3 text-sm text-muted-foreground">
          No previous proof results yet.
        </p>
      ) : null}

      {sortedProofs.length > 0 ? (
        <ol className="mt-6 space-y-5 border-l border-border">
          {sortedProofs.map((proof, index) => (
            <ProofHistoryItem key={`${proof.id}-${proof.requestId}`} proof={proof} isLatest={index === 0} />
          ))}
        </ol>
      ) : null}
    </section>
  );
}
