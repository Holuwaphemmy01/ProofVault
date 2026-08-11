type ProjectRegistrationInput = {
  name: string;
  slug: string;
  website: string;
  projectType: "exchange" | "defi" | "protocol";
  description: string;
};

export function buildProjectRegistrationPayload(input: ProjectRegistrationInput, ownerWallet: string) {
  return {
    ...input,
    ownerWallet,
  };
}
