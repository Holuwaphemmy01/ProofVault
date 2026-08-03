export type Project = {
  id: string;
  name: string;
  slug: string;
  website: string;
  projectType: string;
  description: string;
  ownerWallet: string;
  maskedOwnerWallet: string;
  createdAt: string;
  updatedAt: string;
};

export type ProofRequest = {
  id: string;
  projectSlug: string;
  proofName: string;
  requiredThreshold: number;
  thresholdCurrency: string;
  selectedAssets: string[];
  privacyMode: string;
  thresholdCommitment: string;
  selectedAssetsHash: string;
  metadataHash: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkerProofResult = {
  id: string;
  proofRequestId: string;
  projectSlug: string;
  status: "PASS" | "FAIL";
  thresholdMet: boolean;
  proofHash: string;
  workerSignedAt: number;
  signature: string;
  verifiedWith: string[];
  receivedAt: string;
};
