import Link from "next/link";

export const assets = ["FBTC", "FXRP", "FDOGE", "FLR", "USDX"];

export const proofs = [
  {
    project: "AtlasX Exchange",
    slug: "atlasx-exchange",
    status: "PASS",
    threshold: "$1.2M",
    assets: ["FBTC", "FXRP", "FLR"],
    hash: "0x8f42...19ad",
    updated: "2 minutes ago",
  },
  {
    project: "RiverDAO Treasury",
    slug: "riverdao",
    status: "VERIFYING",
    threshold: "$850K",
    assets: ["FXRP", "USDX"],
    hash: "pending",
    updated: "running",
  },
  {
    project: "BridgeMint",
    slug: "bridgemint",
    status: "PASS",
    threshold: "$3.5M",
    assets: ["FBTC", "FDOGE", "USDX"],
    hash: "0xa31b...f820",
    updated: "18 minutes ago",
  },
];

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.2),transparent_30%),#020617]" />
      <Header />
      {children}
    </main>
  );
}

export function Header() {
  const links = [
    ["Dashboard", "/dashboard"],
    ["Create Proof", "/create-proof"],
    ["Proof Status", "/proof-status"],
    ["Verifier", "/public-verifier"],
  ];

  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
      <Link href="/landing" className="flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded bg-blue-500 text-sm font-black text-white shadow-lg shadow-blue-500/25">
          P
        </span>
        <span className="text-sm font-semibold tracking-wide text-white">ProofVault</span>
      </Link>
      <nav className="hidden items-center gap-7 text-sm text-slate-400 md:flex">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="transition hover:text-white">
            {label}
          </Link>
        ))}
      </nav>
      <Link
        href="/create-proof"
        className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-blue-100"
      >
        New proof
      </Link>
    </header>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-300">{children}</p>;
}

export function StatusPill({ status }: { status: string }) {
  const styles =
    status === "PASS"
      ? "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20"
      : status === "VERIFYING"
        ? "bg-blue-400/10 text-blue-300 ring-blue-400/20"
        : "bg-rose-400/10 text-rose-300 ring-rose-400/20";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles}`}>
      {status}
    </span>
  );
}

export function Metric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-lg bg-white/[0.035] p-5 ring-1 ring-white/10">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {detail ? <p className="mt-1 text-sm text-slate-500">{detail}</p> : null}
    </div>
  );
}

export function AssetRail({ selected = assets }: { selected?: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {selected.map((asset) => (
        <span key={asset} className="rounded-md bg-white/[0.06] px-3 py-1.5 text-sm text-slate-200 ring-1 ring-white/10">
          {asset}
        </span>
      ))}
    </div>
  );
}

export function ReserveVisual() {
  const rings = [
    ["FBTC", "h-32", "bg-blue-400"],
    ["FXRP", "h-24", "bg-violet-400"],
    ["FDOGE", "h-20", "bg-cyan-300"],
    ["FLR", "h-28", "bg-indigo-300"],
    ["USDX", "h-16", "bg-sky-200"],
  ];

  return (
    <div className="rounded-lg bg-white/[0.035] p-6 ring-1 ring-white/10">
      <div className="flex h-64 items-end justify-between gap-3">
        {rings.map(([asset, height, color]) => (
          <div key={asset} className="flex min-w-0 flex-1 flex-col items-center gap-3">
            <div className={`w-full max-w-20 rounded-t-md ${height} ${color} opacity-90 shadow-2xl shadow-blue-500/20`} />
            <span className="text-xs font-semibold text-slate-300">{asset}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-10 pt-12">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight tracking-normal text-white md:text-7xl">
        {title}
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">{subtitle}</p>
    </section>
  );
}

export function ProofTable() {
  return (
    <div className="overflow-hidden rounded-lg bg-white/[0.035] p-4 ring-1 ring-white/10">
      {proofs.map((proof, index) => (
        <div
          key={proof.slug}
          className={`grid gap-4 py-4 md:grid-cols-[1.2fr_0.6fr_1fr_0.8fr] md:items-center ${
            index === proofs.length - 1 ? "" : "border-b border-white/10"
          }`}
        >
          <div>
            <p className="font-medium text-white">{proof.project}</p>
            <p className="mt-1 text-sm text-slate-500">{proof.slug}</p>
          </div>
          <StatusPill status={proof.status} />
          <AssetRail selected={proof.assets} />
          <div className="text-sm text-slate-400 md:text-right">
            <p>{proof.hash}</p>
            <p className="mt-1 text-slate-600">{proof.updated}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
