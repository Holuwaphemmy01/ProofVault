"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanSlug = slug.trim().toLowerCase();

    if (cleanSlug) {
      router.push(`/verify/${encodeURIComponent(cleanSlug)}`);
    }
  }

  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <PublicHeader />

      <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-3xl flex-col justify-center text-center">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Public verifier</p>
        <h1 className="mt-5 font-heading text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          Verify a reserve proof.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
          Search by project slug to view the latest public proof result without logging in or connecting a wallet.
        </p>

        <form onSubmit={handleSubmit} className="mx-auto mt-10 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
          <input
            required
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="atlasx-exchange"
            className="field-input h-12 flex-1 text-center sm:text-left"
          />
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Verify Project
          </button>
        </form>
      </section>
    </main>
  );
}

function PublicHeader() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between">
      <Link href="/" className="text-sm font-semibold tracking-wide text-foreground">
        ProofVault
      </Link>
      <Link href="/create-proof" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        Create Proof
      </Link>
    </header>
  );
}
