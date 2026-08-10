import { ProofLifecycleStatus } from "@/components/proof-status/status-badge";

export function shortenHash(hash?: string | null) {
  if (!hash) {
    return "Not available";
  }

  if (hash.length <= 16) {
    return hash;
  }

  return `${hash.slice(0, 8)}...${hash.slice(-4)}`;
}

export function toLifecycleStatus(status: string): ProofLifecycleStatus {
  const normalized = status.toUpperCase();

  if (normalized === "PASS" || normalized === "PASSED") {
    return "PASSED";
  }

  if (normalized === "FAIL" || normalized === "FAILED") {
    return "FAILED";
  }

  if (normalized === "VERIFYING") {
    return "VERIFYING";
  }

  if (normalized === "EXPIRED" || normalized === "CANCELLED") {
    return "EXPIRED";
  }

  return "PENDING";
}
