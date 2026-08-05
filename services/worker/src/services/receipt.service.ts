import type { ProofOutcome } from "../types/worker.types.js";

type GenerateProofReceiptInput = {
  projectName: string;
  projectSlug: string;
  proofRequestId: string;
  onChainRequestId: string;
  outcome: ProofOutcome;
  thresholdMet: boolean;
  workerSignedAt: number;
  proofHash: string;
  resultMetadataHash: string;
  thresholdCommitment?: string;
  selectedAssetsHash: string;
  encryptedPayloadHash?: string;
  signerAddress: string;
  signature: string;
};

export function generateProofReceipt(input: GenerateProofReceiptInput) {
  return {
    version: "proofvault-receipt-v1",
    project: {
      name: input.projectName,
      slug: input.projectSlug,
    },
    proof: {
      proofRequestId: input.proofRequestId,
      onChainRequestId: input.onChainRequestId,
      status: input.outcome,
      thresholdMet: input.thresholdMet,
      verifiedAt: new Date(input.workerSignedAt * 1000).toISOString(),
    },
    verification: {
      method: "confidential_threshold_proof",
      verifiedWith: ["MOCK_CONFIDENTIAL_COMPUTE"],
      worker: {
        signer: input.signerAddress,
        signature: input.signature,
      },
    },
    commitments: {
      proofHash: input.proofHash,
      resultMetadataHash: input.resultMetadataHash,
      thresholdCommitment: input.thresholdCommitment,
      selectedAssetsHash: input.selectedAssetsHash,
      encryptedPayloadHash: input.encryptedPayloadHash,
    },
    privacy: {
      note: "Exact reserve composition and wallet balances are kept private. This proof verifies that reserves meet or exceed the declared threshold.",
    },
  };
}
