import Link from "next/link";
import { badgeCopy, VerificationBadgeStatus } from "@/lib/proof-badge";

export type VerificationBadgeProps = {
  projectSlug: string;
  projectName?: string;
  status: VerificationBadgeStatus;
  verifiedAt?: string;
  compact?: boolean;
  showTimestamp?: boolean;
  className?: string;
};

const statusStyles: Record<VerificationBadgeStatus, { shell: string; icon: string; mark: string }> = {
  PASSED: {
    shell: "border-green/30 bg-green/10 text-green",
    icon: "bg-green text-background",
    mark: "✓",
  },
  FAILED: {
    shell: "border-red/30 bg-red/10 text-red",
    icon: "bg-red text-background",
    mark: "!",
  },
  PENDING: {
    shell: "border-amber/30 bg-amber/10 text-amber",
    icon: "bg-amber text-background",
    mark: "…",
  },
  VERIFYING: {
    shell: "border-amber/30 bg-amber/10 text-amber",
    icon: "bg-amber text-background",
    mark: "…",
  },
  EXPIRED: {
    shell: "border-border bg-elevated text-muted-foreground",
    icon: "bg-muted-foreground text-background",
    mark: "i",
  },
};

export function VerificationBadge({
  projectSlug,
  projectName,
  status,
  verifiedAt,
  compact = false,
  showTimestamp = true,
  className = "",
}: VerificationBadgeProps) {
  const copy = badgeCopy[status];
  const styles = statusStyles[status];
  const timestamp = verifiedAt ? new Date(verifiedAt).toLocaleString() : undefined;

  return (
    <Link
      href={`/verify/${projectSlug}`}
      aria-label={`View ProofVault verification for ${projectName ?? projectSlug}: ${copy.secondary}`}
      className={`inline-flex max-w-full items-center gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-elevated ${styles.shell} ${className}`}
    >
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${styles.icon}`}>
        {styles.mark}
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-current">
          ProofVault
        </span>
        <span className="block truncate text-sm font-semibold text-foreground">{copy.label}</span>
        {!compact && projectName ? (
          <span className="block truncate text-xs text-muted-foreground">{projectName}</span>
        ) : null}
        {!compact && showTimestamp && timestamp ? (
          <span className="block text-xs text-muted-foreground">Last verified {timestamp}</span>
        ) : null}
      </span>
    </Link>
  );
}
