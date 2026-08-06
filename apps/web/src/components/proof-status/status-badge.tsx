export type ProofLifecycleStatus = "PENDING" | "VERIFYING" | "PASSED" | "FAILED" | "EXPIRED";

const statusStyles: Record<ProofLifecycleStatus, string> = {
  PENDING: "border-amber/30 bg-amber/10 text-amber",
  VERIFYING: "border-primary/30 bg-primary/10 text-primary",
  PASSED: "border-green/30 bg-green/10 text-green",
  FAILED: "border-red/30 bg-red/10 text-red",
  EXPIRED: "border-subtle/30 bg-subtle/10 text-muted-foreground",
};

export function StatusBadge({
  status,
  large = false,
}: {
  status: ProofLifecycleStatus;
  large?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border font-semibold ${statusStyles[status]} ${
        large ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-xs"
      }`}
    >
      {status === "VERIFYING" ? (
        <span className="h-2 w-2 animate-spin rounded-full border border-current border-t-transparent" />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {status}
    </span>
  );
}

export function getLifecycleStatus(proofRequest: Record<string, unknown> | null | undefined): ProofLifecycleStatus {
  const result = getRecord(proofRequest?.result);
  const proofResult = getRecord(proofRequest?.proofResult);
  const latestResult = getRecord(proofRequest?.latestResult);
  const rawStatus = String(
    proofRequest?.status ??
      proofRequest?.outcome ??
      proofRequest?.resultStatus ??
      proofRequest?.proofResultStatus ??
      "",
  ).toUpperCase();
  const outcome = String(
    proofRequest?.outcome ??
      result?.outcome ??
      proofResult?.outcome ??
      latestResult?.outcome ??
      "",
  ).toUpperCase();

  if (rawStatus === "PASS" || rawStatus === "PASSED" || outcome === "PASS" || outcome === "PASSED") {
    return "PASSED";
  }

  if (rawStatus === "FAIL" || rawStatus === "FAILED" || outcome === "FAIL" || outcome === "FAILED") {
    return "FAILED";
  }

  if (rawStatus === "EXPIRED" || rawStatus === "CANCELLED") {
    return "EXPIRED";
  }

  if (rawStatus === "VERIFYING" || rawStatus === "RUNNING" || rawStatus === "PROCESSING") {
    return "VERIFYING";
  }

  if (rawStatus === "COMPLETED") {
    return "PASSED";
  }

  return "PENDING";
}

function getRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : undefined;
}
