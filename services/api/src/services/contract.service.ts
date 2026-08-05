import {
  computeProjectId,
  getRegistryReadContract,
  getRegistryWriteContract,
  proofVaultRegistryAbi,
} from "../lib/contract.js";

type RegisterProjectOnChainInput = {
  name: string;
  slug: string;
  websiteHash: string;
  metadataHash: string;
};

type CreateProofRequestOnChainInput = {
  slug: string;
  thresholdCommitment: string;
  selectedAssets: string;
  selectedAssetsHash: string;
  metadataHash: string;
};

const proofOutcomeLabels = ["PASS", "FAIL"] as const;

function normalizeError(error: unknown) {
  return error instanceof Error ? error.message : "Unknown contract error";
}

export async function registerProjectOnChain(input: RegisterProjectOnChainInput) {
  const registry = getRegistryWriteContract();
  const tx = await registry.registerProject(
    input.name,
    input.slug,
    input.websiteHash,
    input.metadataHash,
  );
  const receipt = await tx.wait();
  const projectId = computeProjectId(input.slug);

  return {
    transactionHash: receipt?.hash ?? tx.hash,
    projectId,
    blockNumber: receipt?.blockNumber,
  };
}

export async function createProofRequestOnChain(input: CreateProofRequestOnChainInput) {
  const registry = getRegistryWriteContract();
  const tx = await registry.createProofRequest(
    input.slug,
    input.thresholdCommitment,
    input.selectedAssets,
    input.selectedAssetsHash,
    input.metadataHash,
  );
  const receipt = await tx.wait();
  let requestId: string | null = null;

  for (const log of receipt?.logs ?? []) {
    try {
      const parsed = registry.interface.parseLog(log);

      if (parsed?.name === "ProofRequestCreated") {
        requestId = parsed.args.requestId.toString();
        break;
      }
    } catch {
      // Ignore logs from other contracts in the same transaction receipt.
    }
  }

  return {
    transactionHash: receipt?.hash ?? tx.hash,
    requestId,
    blockNumber: receipt?.blockNumber,
  };
}

export async function projectExistsOnChain(slug: string) {
  const registry = getRegistryReadContract();
  return Boolean(await registry.projectExists(slug));
}

export async function getProjectOnChain(slug: string) {
  const registry = getRegistryReadContract();
  const project = await registry.getProjectBySlug(slug);

  return {
    name: project.name,
    slug: project.slug,
    websiteHash: project.websiteHash,
    metadataHash: project.metadataHash,
    owner: project.owner,
    exists: project.exists,
    createdAt: project.createdAt?.toString(),
    updatedAt: project.updatedAt?.toString(),
  };
}

export async function getLatestProofStatusOnChain(slug: string) {
  const hasLatestProofQuery = proofVaultRegistryAbi.some((entry) =>
    entry.startsWith("function getLatestProofResultBySlug"),
  );

  if (!hasLatestProofQuery) {
    return { hasProof: false, reason: "latest proof query not available" };
  }

  try {
    const registry = getRegistryReadContract();
    const proofResult = await registry.getLatestProofResultBySlug(slug);
    const outcome = Number(proofResult.outcome);

    return {
      hasProof: true,
      proofHash: proofResult.proofHash,
      outcome: proofOutcomeLabels[outcome] ?? outcome.toString(),
      thresholdMet: proofResult.thresholdMet,
      submittedAt: proofResult.submittedAt?.toString(),
      resultMetadataHash: proofResult.resultMetadataHash,
    };
  } catch (error) {
    const message = normalizeError(error);

    if (message.includes("Proof result does not exist")) {
      return { hasProof: false };
    }

    return { hasProof: false, reason: message };
  }
}
