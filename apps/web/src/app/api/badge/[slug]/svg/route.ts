import { NextResponse } from "next/server";
import { badgeCopy, isValidProjectSlug, LatestProofResponse, normalizeBadgeStatus } from "@/lib/proof-badge";

const neutralSvgLabel = "No Active Proof";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const safeSlug = slug.toLowerCase();

  if (!isValidProjectSlug(safeSlug)) {
    return svgResponse(createBadgeSvg("ProofVault", neutralSvgLabel, "neutral"));
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/public/projects/${safeSlug}/latest-proof`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return svgResponse(createBadgeSvg("ProofVault", neutralSvgLabel, "neutral"));
    }

    const payload = (await response.json()) as LatestProofResponse;
    const status = normalizeBadgeStatus(payload.proofResult);
    const label = badgeCopy[status].svgLabel;
    const tone = status === "PASSED" ? "success" : status === "FAILED" ? "danger" : status === "EXPIRED" ? "neutral" : "pending";

    return svgResponse(createBadgeSvg("ProofVault", label, tone));
  } catch {
    return svgResponse(createBadgeSvg("ProofVault", neutralSvgLabel, "neutral"));
  }
}

function svgResponse(svg: string) {
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}

function createBadgeSvg(brand: string, status: string, tone: "success" | "danger" | "pending" | "neutral") {
  const colors = {
    success: { bg: "#052e24", border: "#10b981", text: "#d1fae5", mark: "#10b981", symbol: "✓" },
    danger: { bg: "#3b0d12", border: "#ef4444", text: "#fee2e2", mark: "#ef4444", symbol: "!" },
    pending: { bg: "#2f2104", border: "#f59e0b", text: "#fef3c7", mark: "#f59e0b", symbol: "…" },
    neutral: { bg: "#101827", border: "#243044", text: "#e2e8f0", mark: "#64748b", symbol: "i" },
  }[tone];
  const title = escapeXml(`${brand} - ${status}`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="44" viewBox="0 0 220 44" role="img" aria-labelledby="title">
  <title id="title">${title}</title>
  <rect x="0.5" y="0.5" width="219" height="43" rx="10" fill="${colors.bg}" stroke="${colors.border}" />
  <circle cx="22" cy="22" r="11" fill="${colors.mark}" />
  <text x="22" y="27" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#04121a">${escapeXml(colors.symbol)}</text>
  <text x="42" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="${colors.text}" letter-spacing="1.4">PROOFVAULT</text>
  <text x="42" y="31" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="${colors.text}">${escapeXml(status)}</text>
</svg>`;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
