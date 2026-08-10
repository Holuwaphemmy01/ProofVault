type ProofStatus = "PASS" | "FAIL" | "PENDING" | "VERIFYING" | "EXPIRED";

type TrustExplanationProps = {
  status: ProofStatus;
  verifiedAt?: string;
  verificationMethod?: string;
  verifiedWith?: string[];
};

const statusMessages: Record<ProofStatus, string> = {
  PASS: "ProofVault verified that the declared reserve threshold was met at the stated verification time.",
  FAIL: "ProofVault could not confirm that the declared reserve threshold was met at the stated verification time.",
  PENDING: "This proof request has been created but has not completed verification.",
  VERIFYING: "ProofVault is currently processing the reserve verification.",
  EXPIRED: "This proof is older than the configured validity period and should not be treated as current.",
};

const sourceLabels: Record<string, string> = {
  FDC_ADDRESS_VALIDITY: "FDC AddressValidity",
  FDC_PAYMENT: "FDC Payment",
  FTSO: "FTSO price feeds",
  FCC: "Confidential compute",
  MOCK_CONFIDENTIAL_COMPUTE: "Mock confidential compute",
};

export function TrustExplanation({
  status,
  verifiedAt,
  verificationMethod = "Confidential threshold proof",
  verifiedWith = [],
}: TrustExplanationProps) {
  const actualSources = verifiedWith.map((source) => sourceLabels[source] ?? formatSource(source));
  const timestamp = formatTimestamp(verifiedAt);

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
            Point-in-time verification
          </p>
          <h2 className="mt-3 font-heading text-2xl font-semibold text-foreground">
            What this ProofVault proof means.
          </h2>
        </div>
        <div className="rounded-full bg-elevated px-3 py-1.5 text-xs font-semibold text-muted-foreground">
          {verificationMethod}
        </div>
      </div>

      <p className="mt-5 leading-7 text-muted-foreground">{statusMessages[status]}</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl bg-elevated p-5">
          <h3 className="font-heading text-lg font-semibold text-foreground">What this proof confirms</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            This proof confirms that the project&apos;s declared reserve threshold was checked at the
            stated verification time using the verification methods shown below.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <TrustItem text="The declared reserve threshold was evaluated at the time of verification." />
            <TrustItem text="The result was generated from the configured ProofVault verification workflow." />
            <TrustItem text="The result is tied to a cryptographic proof hash." />
            <TrustItem text="The proof can be checked against the public ProofVault record." />
          </ul>

          {actualSources.length > 0 ? (
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-sm font-medium text-foreground">Verified using:</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {actualSources.map((source) => (
                  <TrustItem key={source} text={source} />
                ))}
              </ul>
            </div>
          ) : null}
        </article>

        <article className="rounded-xl bg-elevated p-5">
          <h3 className="font-heading text-lg font-semibold text-foreground">
            What this proof does not confirm
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            This proof is a point-in-time reserve verification. It should not be interpreted as a
            guarantee of future solvency, regulatory compliance, or recovery of user funds.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <TrustItem text="It does not prove the organization is solvent forever." />
            <TrustItem text="It does not prove reserves remained unchanged after the timestamp." />
            <TrustItem text="It does not independently audit every liability or customer obligation." />
            <TrustItem text="It does not prevent the organization from moving funds after verification." />
            <TrustItem text="It does not mean the project is risk-free, regulated, or legally compliant." />
            <TrustItem text="It does not mean ProofVault guarantees recovery of user funds." />
          </ul>
        </article>
      </div>

      <div className="mt-5 rounded-xl bg-background p-5">
        <h3 className="font-heading text-lg font-semibold text-foreground">Verification time</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Verified at: <span className="font-medium text-foreground">{timestamp}</span>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Reserve conditions can change after this timestamp.
        </p>
        {status === "EXPIRED" ? (
          <p className="mt-2 text-sm font-medium text-amber">
            This proof is no longer considered current.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function TrustItem({ text }: { text: string }) {
  return (
    <li className="flex gap-2">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      <span>{text}</span>
    </li>
  );
}

function formatTimestamp(value?: string) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function formatSource(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase());
}
