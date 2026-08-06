"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { api } from "@/lib/api";

const projects = [
  { name: "AtlasX Exchange", slug: "atlasx-exchange" },
  { name: "RiverDAO Treasury", slug: "riverdao" },
];

const supportedAssets = ["FXRP", "FBTC", "FDOGE", "FLR"];

type WalletSource = {
  assetSymbol: string;
  chain: string;
  walletAddress: string;
};

const emptyWallet: WalletSource = {
  assetSymbol: "FXRP",
  chain: "flare",
  walletAddress: "",
};

export default function CreateProofPage() {
  const router = useRouter();
  const [projectSlug, setProjectSlug] = useState(projects[0].slug);
  const [selectedAssets, setSelectedAssets] = useState<string[]>(["FXRP", "FBTC"]);
  const [requiredThreshold, setRequiredThreshold] = useState("1000000");
  const [wallets, setWallets] = useState<WalletSource[]>([
    { assetSymbol: "FXRP", chain: "flare", walletAddress: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedProject = useMemo(
    () => projects.find((project) => project.slug === projectSlug) ?? projects[0],
    [projectSlug],
  );

  function toggleAsset(asset: string) {
    setSelectedAssets((current) =>
      current.includes(asset) ? current.filter((item) => item !== asset) : [...current, asset],
    );
  }

  function updateWallet(index: number, field: keyof WalletSource, value: string) {
    setWallets((current) =>
      current.map((wallet, walletIndex) =>
        walletIndex === index ? { ...wallet, [field]: value } : wallet,
      ),
    );
  }

  function addWallet() {
    setWallets((current) => [...current, { ...emptyWallet }]);
  }

  function removeWallet(index: number) {
    setWallets((current) => (current.length === 1 ? current : current.filter((_, itemIndex) => itemIndex !== index)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const threshold = Number(requiredThreshold);
    const cleanWallets = wallets.map((wallet) => ({
      ...wallet,
      walletAddress: wallet.walletAddress.trim(),
    }));

    if (selectedAssets.length === 0) {
      setError("Select at least one asset.");
      return;
    }

    if (!Number.isFinite(threshold) || threshold <= 0) {
      setError("Enter a valid USD threshold.");
      return;
    }

    if (cleanWallets.some((wallet) => !wallet.walletAddress)) {
      setError("Add a wallet address for every wallet source.");
      return;
    }

    const privatePayload = {
      projectSlug,
      requiredThreshold: threshold,
      selectedAssets,
      wallets: cleanWallets,
    };

    const encryptedProofPayload = {
      version: "proofvault-encrypted-payload-v1",
      algorithm: "mock",
      keyId: "dev-key",
      ciphertext: btoa(JSON.stringify(privatePayload)),
      payloadHash: "0xmockhash",
      createdAt: new Date().toISOString(),
    };

    const walletReferenceSummaries = cleanWallets.map((wallet) => ({
      assetSymbol: wallet.assetSymbol,
      chain: wallet.chain,
      walletAddressHash: mockWalletHash(wallet.walletAddress),
      maskedWalletAddress: maskWalletAddress(wallet.walletAddress),
    }));

    setIsSubmitting(true);

    try {
      await api.post("/proof-requests", {
        projectSlug,
        selectedAssets,
        encryptedProofPayload,
        walletReferenceSummaries,
      });

      setSuccess("Proof request created. Redirecting to dashboard...");
      setWallets(cleanWallets.map((wallet) => ({ ...wallet, walletAddress: maskWalletAddress(wallet.walletAddress) })));
      window.setTimeout(() => router.push("/dashboard"), 700);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Proof request creation failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Create proof</p>
          <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Create a confidential reserve proof.
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Build an encrypted proof payload from selected assets and wallet sources. Only safe wallet
            summaries are sent outside the private payload.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          <section className="grid gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-2">
            <Field label="Project">
              <select value={projectSlug} onChange={(event) => setProjectSlug(event.target.value)} className="field-input">
                {projects.map((project) => (
                  <option key={project.slug} value={project.slug}>
                    {project.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Threshold input (USD)">
              <input
                required
                inputMode="numeric"
                min="1"
                type="number"
                value={requiredThreshold}
                onChange={(event) => setRequiredThreshold(event.target.value)}
                className="field-input"
              />
            </Field>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm font-medium text-muted-foreground">Asset selector</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {supportedAssets.map((asset) => {
                const active = selectedAssets.includes(asset);

                return (
                  <button
                    key={asset}
                    type="button"
                    onClick={() => toggleAsset(asset)}
                    className={
                      active
                        ? "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                        : "rounded-lg border border-border bg-elevated px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    }
                  >
                    {asset}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Wallet sources</p>
                <p className="mt-1 text-sm text-subtle">Add one or more wallets for the private reserve check.</p>
              </div>
              <button
                type="button"
                onClick={addWallet}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-elevated px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                Add wallet
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {wallets.map((wallet, index) => (
                <div key={index} className="grid gap-4 rounded-xl bg-elevated p-4 md:grid-cols-[0.75fr_0.75fr_1.5fr_auto] md:items-end">
                  <Field label="Asset">
                    <select
                      value={wallet.assetSymbol}
                      onChange={(event) => updateWallet(index, "assetSymbol", event.target.value)}
                      className="field-input"
                    >
                      {supportedAssets.map((asset) => (
                        <option key={asset} value={asset}>
                          {asset}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Chain">
                    <input
                      required
                      value={wallet.chain}
                      onChange={(event) => updateWallet(index, "chain", event.target.value)}
                      placeholder="flare"
                      className="field-input"
                    />
                  </Field>

                  <Field label="Wallet Address">
                    <input
                      required
                      value={wallet.walletAddress}
                      onChange={(event) => updateWallet(index, "walletAddress", event.target.value)}
                      placeholder="0x92A7F13C..."
                      className="field-input font-mono"
                    />
                  </Field>

                  <button
                    type="button"
                    onClick={() => removeWallet(index)}
                    className="h-11 rounded-lg border border-border px-4 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-elevated p-6">
            <p className="text-sm font-semibold text-foreground">Privacy notice</p>
            <p className="mt-2 leading-7 text-muted-foreground">
              Full wallet addresses are included only inside the mock encrypted payload. The public
              request stores wallet hashes and masked addresses for safe tracking.
            </p>
          </section>

          <section className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Project</p>
              <p className="mt-1 font-medium text-foreground">{selectedProject.name}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {error ? <p className="rounded-lg bg-red/10 px-4 py-3 text-sm text-red">{error}</p> : null}
              {success ? <p className="rounded-lg bg-green/10 px-4 py-3 text-sm text-green">{success}</p> : null}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Creating..." : "Create proof request"}
              </button>
            </div>
          </section>
        </form>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function maskWalletAddress(address: string) {
  if (address.length <= 12) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function mockWalletHash(address: string) {
  let hash = 0;

  for (let index = 0; index < address.length; index += 1) {
    hash = (hash * 31 + address.charCodeAt(index)) >>> 0;
  }

  return `0x${hash.toString(16).padStart(8, "0")}mock`;
}
