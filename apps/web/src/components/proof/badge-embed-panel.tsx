"use client";

import { useMemo, useState } from "react";

type BadgeEmbedPanelProps = {
  projectName: string;
  projectSlug: string;
  appUrl: string;
  statusLabel: string;
};

export function BadgeEmbedPanel({ projectName, projectSlug, appUrl, statusLabel }: BadgeEmbedPanelProps) {
  const [copied, setCopied] = useState("");
  const verificationUrl = `${appUrl}/verify/${projectSlug}`;
  const svgUrl = `${appUrl}/api/badge/${projectSlug}/svg`;

  const imageSnippet = useMemo(
    () => `<a
  href="${verificationUrl}"
  target="_blank"
  rel="noopener noreferrer"
>
  <img
    src="${svgUrl}"
    alt="${projectName} reserve status verified by ProofVault"
  />
</a>`,
    [projectName, svgUrl, verificationUrl],
  );

  const styledSnippet = useMemo(
    () => `<a
  href="${verificationUrl}"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="${projectName} reserve status verified by ProofVault"
  style="display:inline-flex;align-items:center;gap:10px;padding:10px 14px;border:1px solid #243044;border-radius:12px;background:#101827;color:#f8fafc;font-family:Inter,Arial,sans-serif;text-decoration:none;"
>
  <span style="display:inline-grid;width:24px;height:24px;place-items:center;border-radius:999px;background:#22d3ee;color:#04121a;font-weight:700;">✓</span>
  <span>
    <strong style="display:block;font-size:13px;">ProofVault</strong>
    <span style="display:block;font-size:12px;color:#94a3b8;">${statusLabel}</span>
  </span>
</a>`,
    [projectName, statusLabel, verificationUrl],
  );

  async function copy(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1600);
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">Embedding options</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Use your public app URL from <code className="text-foreground">NEXT_PUBLIC_APP_URL</code>. These snippets do not include private proof data.
          </p>
        </div>
        <button
          type="button"
          onClick={() => copy("Verification URL", verificationUrl)}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {copied === "Verification URL" ? "Copied" : "Copy URL"}
        </button>
      </div>

      <SnippetBlock
        title="Method 1 - Simple link badge"
        value={imageSnippet}
        copied={copied === "HTML badge"}
        onCopy={() => copy("HTML badge", imageSnippet)}
      />

      <SnippetBlock
        title="Method 2 - JavaScript-free styled badge"
        value={styledSnippet}
        copied={copied === "Styled badge"}
        onCopy={() => copy("Styled badge", styledSnippet)}
      />
    </section>
  );
}

function SnippetBlock({
  title,
  value,
  copied,
  onCopy,
}: {
  title: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-lg border border-border bg-elevated px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          {copied ? "Copied" : "Copy snippet"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-xl bg-background p-4 text-xs leading-6 text-muted-foreground">
        <code>{value}</code>
      </pre>
    </div>
  );
}
