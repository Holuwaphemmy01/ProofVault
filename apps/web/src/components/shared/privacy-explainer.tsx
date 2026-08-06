const privacySections = [
  {
    title: "Private",
    description: "Sensitive treasury details stay hidden.",
    items: ["Wallet addresses", "Exact balances", "Reserve composition"],
  },
  {
    title: "Encrypted",
    description: "Submitted reserve data is wrapped before processing.",
    items: ["Submitted wallet data", "Asset holdings"],
  },
  {
    title: "Verified",
    description: "ProofVault checks the claim without showing the raw data.",
    items: ["Whether reserves meet threshold", "Cryptographic proof result"],
  },
  {
    title: "Public",
    description: "Only safe proof outputs are shown to verifiers.",
    items: ["PASS/FAIL result", "Proof hash", "Signature", "Timestamp"],
  },
];

export function PrivacyExplainer() {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Privacy boundary</p>
        <h2 className="mt-3 font-heading text-2xl font-semibold text-foreground">
          What stays private and what becomes public.
        </h2>
        <p className="mt-3 leading-7 text-muted-foreground">
          ProofVault turns sensitive reserve data into a simple proof result without exposing wallet
          strategy, addresses, or exact balances.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {privacySections.map((section) => (
          <article key={section.title} className="rounded-xl bg-elevated p-5">
            <h3 className="font-heading text-lg font-semibold text-foreground">{section.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{section.description}</p>
            <ul className="mt-4 space-y-2">
              {section.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
