export type VerificationBadgeStatus = "PASSED" | "FAILED" | "PENDING" | "VERIFYING" | "EXPIRED";

export type LatestProofResponse = {
  project?: {
    name?: string;
    slug?: string;
    projectType?: string;
  };
  proofResult?: {
    outcome?: string;
    status?: string;
    thresholdMet?: boolean;
    workerSignedAt?: string | number;
    submittedAt?: string;
    timestamp?: string;
    receipt?: {
      proof?: {
        status?: string;
        thresholdMet?: boolean;
        verifiedAt?: string;
      };
    };
  };
};

export const badgeCopy: Record<VerificationBadgeStatus, { label: string; secondary: string; svgLabel: string }> = {
  PASSED: {
    label: "Reserves Verified",
    secondary: "Passed",
    svgLabel: "Reserves Verified",
  },
  FAILED: {
    label: "Reserve Verification Failed",
    secondary: "Failed",
    svgLabel: "Verification Failed",
  },
  PENDING: {
    label: "Reserve Proof Pending",
    secondary: "Pending",
    svgLabel: "Verification Pending",
  },
  VERIFYING: {
    label: "Reserve Verification in Progress",
    secondary: "Verifying",
    svgLabel: "Verification Pending",
  },
  EXPIRED: {
    label: "Reserve Proof Expired",
    secondary: "Expired",
    svgLabel: "Proof Expired",
  },
};

export function normalizeBadgeStatus(result?: LatestProofResponse["proofResult"] | null): VerificationBadgeStatus {
  if (!result) {
    return "PENDING";
  }

  const status = String(result.outcome ?? result.status ?? result.receipt?.proof?.status ?? "").toUpperCase();

  if (status === "PASS" || status === "PASSED") {
    return "PASSED";
  }

  if (status === "FAIL" || status === "FAILED") {
    return "FAILED";
  }

  if (status === "VERIFYING" || status === "RUNNING" || status === "PROCESSING") {
    return "VERIFYING";
  }

  if (status === "EXPIRED" || status === "CANCELLED") {
    return "EXPIRED";
  }

  if (result.thresholdMet === true || result.receipt?.proof?.thresholdMet === true) {
    return "PASSED";
  }

  if (result.thresholdMet === false) {
    return "FAILED";
  }

  return "PENDING";
}

export function getVerifiedAt(result?: LatestProofResponse["proofResult"] | null) {
  const timestamp = result?.receipt?.proof?.verifiedAt ?? result?.workerSignedAt ?? result?.submittedAt ?? result?.timestamp;

  if (!timestamp) {
    return undefined;
  }

  if (typeof timestamp === "number") {
    return new Date(timestamp * 1000).toISOString();
  }

  const date = new Date(timestamp);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function isValidProjectSlug(slug: string) {
  return /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/.test(slug);
}

export function getPublicAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "https://your-proofvault-domain.example").replace(/\/$/, "");
}
