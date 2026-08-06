"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const MOCK_WALLET_ADDRESS = "0x92A7F13C00000000000000000000000000000000";

type ProjectType = "exchange" | "defi" | "protocol";

type FormState = {
  name: string;
  slug: string;
  website: string;
  projectType: ProjectType;
  description: string;
};

const initialFormState: FormState = {
  name: "",
  slug: "",
  website: "",
  projectType: "exchange",
  description: "",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [ownerWallet, setOwnerWallet] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!ownerWallet) {
      setError("Connect a wallet before registering your project.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/projects", {
        ...form,
        ownerWallet,
      });

      setSuccess("Project registered successfully. Redirecting to dashboard...");
      window.setTimeout(() => router.push("/dashboard"), 700);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Project registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl flex-col justify-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Project onboarding</p>
          <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Register your ProofVault project.
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Add the public project profile used for reserve proof requests and public verification.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6 rounded-2xl border border-border bg-card p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Project Name">
              <input
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="AtlasX Exchange"
                className="field-input"
              />
            </Field>

            <Field label="Project Slug">
              <input
                required
                value={form.slug}
                onChange={(event) => updateField("slug", event.target.value)}
                placeholder="atlasx-exchange"
                className="field-input"
              />
            </Field>
          </div>

          <Field label="Website">
            <input
              required
              type="url"
              value={form.website}
              onChange={(event) => updateField("website", event.target.value)}
              placeholder="https://atlasx.exchange"
              className="field-input"
            />
          </Field>

          <Field label="Project Type">
            <select
              value={form.projectType}
              onChange={(event) => updateField("projectType", event.target.value as ProjectType)}
              className="field-input"
            >
              <option value="exchange">Exchange</option>
              <option value="defi">DeFi</option>
              <option value="protocol">Protocol</option>
            </select>
          </Field>

          <Field label="Description">
            <textarea
              required
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Confidential proof-of-reserves for AtlasX customer assets."
              rows={4}
              className="field-input resize-none"
            />
          </Field>

          <div className="rounded-xl bg-elevated p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Wallet Address</p>
                <p className="mt-1 font-mono text-sm text-muted-foreground">
                  {ownerWallet || "No wallet connected"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOwnerWallet(MOCK_WALLET_ADDRESS)}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {ownerWallet ? "Wallet Connected" : "Connect Wallet"}
              </button>
            </div>
          </div>

          {error ? <p className="rounded-lg bg-red/10 px-4 py-3 text-sm text-red">{error}</p> : null}
          {success ? <p className="rounded-lg bg-green/10 px-4 py-3 text-sm text-green">{success}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Registering..." : "Register Project"}
          </button>
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
