import type { BlockTag } from "ethers";
import {
  computeProjectId,
  getProvider,
  getRegistryAddress,
  getRegistryReadContract,
  getRegistryWriteContract,
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

const proofRequestStatusLabels = ["Created", "Verifying", "Completed", "Cancelled"] as const;
const proofOutcomeLabels = ["PASS", "FAIL"] as const;

function normalizeError(error: unknown, fallback = "Contract call failed") {
  return error instanceof Error ? error.message : fallback;
}

function toStringValue(value: unknown) {
  return typeof value === "bigint" ? value.toString() : String(value);
}

function normalizeBlockTag(value?: string | number) {
  if (value === undefined || value === "") {
    return undefined;
  }

  if (value === "latest") {
    return value;
  }

  const blockNumber = Number(value);
  return Number.isInteger(blockNumber) && blockNumber >= 0 ? blockNumber : undefined;
}

function normalizeProject(project: any) {
  return {
    name: project.name,
    slug: project.slug,
    websiteHash: project.websiteHash,
    metadataHash: project.metadataHash,
    owner: project.owner,
    exists: Boolean(project.exists),
    createdAt: toStringValue(project.createdAt),
    updatedAt: toStringValue(project.updatedAt),
  };
}

function normalizeProofRequest(proofRequest: any) {
  const status = Number(proofRequest.status);

  return {
    id: toStringValue(proofRequest.id),
    projectId: proofRequest.projectId,
    thresholdCommitment: proofRequest.thresholdCommitment,
    selectedAssetsHash: proofRequest.selectedAssetsHash,
    selectedAssets: proofRequest.selectedAssets,
    metadataHash: proofRequest.metadataHash,
    createdBy: proofRequest.createdBy,
    createdAt: toStringValue(proofRequest.createdAt),
    status: proofRequestStatusLabels[status] ?? status.toString(),
    exists: Boolean(proofRequest.exists),
  };
}

function normalizeProofResult(proofResult: any) {
  const outcome = Number(proofResult.outcome);

  return {
    id: toStringValue(proofResult.id),
    requestId: toStringValue(proofResult.requestId),
    projectId: proofResult.projectId,
    proofHash: proofResult.proofHash,
    outcome: proofOutcomeLabels[outcome] ?? outcome.toString(),
    thresholdMet: Boolean(proofResult.thresholdMet),
    resultMetadataHash: proofResult.resultMetadataHash,
    submittedBy: proofResult.submittedBy,
    relayedBy: proofResult.relayedBy,
    workerSignedAt: toStringValue(proofResult.workerSignedAt),
    submittedAt: toStringValue(proofResult.submittedAt),
    exists: Boolean(proofResult.exists),
  };
}

export async function getContractHealth() {
  try {
    const provider = getProvider();
    const registryAddress = getRegistryAddress();
    const [network, blockNumber, code] = await Promise.all([
      provider.getNetwork(),
      provider.getBlockNumber(),
      provider.getCode(registryAddress),
    ]);

    return {
      connected: true,
      chainId: network.chainId.toString(),
      blockNumber,
      registryAddress,
      contractReachable: code !== "0x",
    };
  } catch (error) {
    return {
      connected: false,
      registryAddress: null,
      contractReachable: false,
      error: normalizeError(error, "Contract is not configured"),
    };
  }
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
  return {
    exists: Boolean(await registry.projectExists(slug)),
  };
}

export async function getProjectOnChain(slug: string) {
  try {
    const registry = getRegistryReadContract();
    const project = await registry.getProjectBySlug(slug);
    return normalizeProject(project);
  } catch (error) {
    const message = normalizeError(error);

    if (message.includes("Project does not exist")) {
      return null;
    }

    throw error;
  }
}

export async function getProofRequestOnChain(requestId: string | number) {
  const registry = getRegistryReadContract();
  const proofRequest = await registry.getProofRequest(requestId);
  return normalizeProofRequest(proofRequest);
}

export async function getProofResultOnChain(resultId: string | number) {
  const registry = getRegistryReadContract();
  const proofResult = await registry.getProofResult(resultId);
  return normalizeProofResult(proofResult);
}

export async function getProofResultByRequestIdOnChain(requestId: string | number) {
  try {
    const registry = getRegistryReadContract();
    const proofResult = await registry.getProofResultByRequestId(requestId);

    return {
      hasResult: true,
      result: normalizeProofResult(proofResult),
    };
  } catch (error) {
    const message = normalizeError(error);

    if (message.includes("Proof result does not exist")) {
      return { hasResult: false };
    }

    throw error;
  }
}

export async function getLatestProofStatusOnChain(slug: string) {
  try {
    const registry = getRegistryReadContract();
    const proofResult = await registry.getLatestProofResultBySlug(slug);
    const normalized = normalizeProofResult(proofResult);

    return {
      hasProof: true,
      proofHash: normalized.proofHash,
      outcome: normalized.outcome,
      thresholdMet: normalized.thresholdMet,
      resultMetadataHash: normalized.resultMetadataHash,
      submittedBy: normalized.submittedBy,
      relayedBy: normalized.relayedBy,
      workerSignedAt: normalized.workerSignedAt,
      submittedAt: normalized.submittedAt,
    };
  } catch (error) {
    const message = normalizeError(error);

    if (
      message.includes("Proof result does not exist") ||
      message.includes("function selector was not recognized") ||
      message.includes("could not decode result data")
    ) {
      return { hasProof: false, reason: "No proof result found" };
    }

    return { hasProof: false, reason: message };
  }
}

export async function getProjectProofHistoryOnChain(slug: string) {
  try {
    const registry = getRegistryReadContract();
    const proofResultIds = await registry.getProjectProofResultIds(slug);
    const resultIds = proofResultIds.map((id: bigint) => id.toString());
    const results = await Promise.all(resultIds.map((id: string) => getProofResultOnChain(id)));

    return {
      projectSlug: slug,
      proofResultIds: resultIds,
      results,
    };
  } catch (error) {
    const message = normalizeError(error);

    if (
      message.includes("Project does not exist") ||
      message.includes("function selector was not recognized") ||
      message.includes("could not decode result data")
    ) {
      return {
        projectSlug: slug,
        proofResultIds: [],
        results: [],
        reason: "No proof history found",
      };
    }

    throw error;
  }
}

export async function readProjectRegisteredEvents(fromBlock?: string | number, toBlock?: string | number) {
  const registry = getRegistryReadContract() as any;
  const events = await registry.queryFilter(
    registry.filters.ProjectRegistered(),
    normalizeBlockTag(fromBlock) as BlockTag | undefined,
    normalizeBlockTag(toBlock) as BlockTag | undefined,
  );

  return events.map((event: any) => ({
    projectId: event.args.projectId,
    name: event.args.name,
    slug: event.args.slug,
    websiteHash: event.args.websiteHash,
    metadataHash: event.args.metadataHash,
    owner: event.args.owner,
    createdAt: toStringValue(event.args.createdAt),
    transactionHash: event.transactionHash,
    blockNumber: event.blockNumber,
  }));
}

export async function readProofRequestCreatedEvents(fromBlock?: string | number, toBlock?: string | number) {
  const registry = getRegistryReadContract() as any;
  const events = await registry.queryFilter(
    registry.filters.ProofRequestCreated(),
    normalizeBlockTag(fromBlock) as BlockTag | undefined,
    normalizeBlockTag(toBlock) as BlockTag | undefined,
  );

  return events.map((event: any) => ({
    requestId: toStringValue(event.args.requestId),
    projectId: event.args.projectId,
    thresholdCommitment: event.args.thresholdCommitment,
    selectedAssetsHash: event.args.selectedAssetsHash,
    selectedAssets: event.args.selectedAssets,
    metadataHash: event.args.metadataHash,
    createdBy: event.args.createdBy,
    createdAt: toStringValue(event.args.createdAt),
    transactionHash: event.transactionHash,
    blockNumber: event.blockNumber,
  }));
}

export async function readProofResultSubmittedEvents(fromBlock?: string | number, toBlock?: string | number) {
  const registry = getRegistryReadContract() as any;
  const events = await registry.queryFilter(
    registry.filters.ProofResultSubmitted(),
    normalizeBlockTag(fromBlock) as BlockTag | undefined,
    normalizeBlockTag(toBlock) as BlockTag | undefined,
  );

  return events.map((event: any) => {
    const outcome = Number(event.args.outcome);

    return {
      resultId: toStringValue(event.args.resultId),
      requestId: toStringValue(event.args.requestId),
      projectId: event.args.projectId,
      proofHash: event.args.proofHash,
      outcome: proofOutcomeLabels[outcome] ?? outcome.toString(),
      thresholdMet: Boolean(event.args.thresholdMet),
      resultMetadataHash: event.args.resultMetadataHash,
      submittedBy: event.args.submittedBy,
      submittedAt: toStringValue(event.args.submittedAt),
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber,
    };
  });
}
