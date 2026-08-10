"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/proof-status/status-badge";
import { shortenHash, toLifecycleStatus } from "./proof-history-utils";
import type { ProofHistoryEntry } from "./proof-history";

export function ProofHistoryItem({
  proof,
  isLatest = false,
}: {
  proof: ProofHistoryEntry;
  isLatest?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const status = toLifecycleStatus(proof.status);
  const verifiedAt = formatTimestamp(proof.verifiedAt);

  async function copyProofHash() {
    await navigator.clipboard.writeText(proof.proofHash);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <li className="relative pl-8">
      <span
        className={`absolute left-0 top-2 h-3 w-3 rounded-full ${
          status === "PASSED" ? "bg-green" : status === "FAILED" ? "bg-red" : "bg-amber"
        }`}
      />
      <div className="rounded-xl bg-elevated p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={status} />
              {isLatest ? (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  Latest
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{verifiedAt}</p>
            <p className="mt-2 break-all font-mono text-sm text-foreground">
              Proof: {shortenHash(proof.proofHash)}
            </p>
            {proof.transactionHash ? (
              <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                Tx: {shortenHash(proof.transactionHash)}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyProofHash}
              className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              {copied ? "Copied" : "Copy hash"}
            </button>
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              View Proof
            </button>
          </div>
        </div>

        {expanded ? (
          <dl className="mt-4 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
            <Detail label="Status" value={proof.status} />
            <Detail label="Threshold met" value={proof.thresholdMet ? "Yes" : "No"} />
            <Detail label="Request ID" value={proof.requestId} mono />
            <Detail label="Result ID" value={proof.id} mono />
            <Detail label="Proof hash" value={proof.proofHash} mono />
            {proof.transactionHash ? <Detail label="Transaction hash" value={proof.transactionHash} mono /> : null}
            {proof.onChainRequestId ? <Detail label="On-chain request ID" value={proof.onChainRequestId} mono /> : null}
            {proof.onChainResultId ? <Detail label="On-chain result ID" value={proof.onChainResultId} mono /> : null}
          </dl>
        ) : null}
      </div>
    </li>
  );
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`mt-1 break-all text-foreground ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}

function formatTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
