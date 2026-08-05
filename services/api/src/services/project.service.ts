import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";
import type { CreateProjectInput } from "../schemas/project.schema.js";
import {
  getLatestProofStatusOnChain,
  getProjectOnChain,
  projectExistsOnChain,
  registerProjectOnChain,
} from "./contract.service.js";

function sha256(value: string) {
  return `0x${crypto.createHash("sha256").update(value).digest("hex")}`;
}

function maskWallet(walletAddress: string) {
  if (!walletAddress || walletAddress.length < 10) {
    return walletAddress;
  }

  return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
}

export async function createProject(input: CreateProjectInput) {
  const websiteHash = sha256(input.website);
  const metadataHash = sha256(JSON.stringify({
    name: input.name,
    slug: input.slug,
    website: input.website,
    projectType: input.projectType,
    description: input.description,
  }));

  try {
    const project = await prisma.project.upsert({
      where: { slug: input.slug },
      update: {
        name: input.name,
        website: input.website,
        websiteHash,
        metadataHash,
        projectType: input.projectType,
        description: input.description,
        ownerWallet: input.ownerWallet,
        maskedOwnerWallet: maskWallet(input.ownerWallet),
      },
      create: {
        name: input.name,
        slug: input.slug,
        website: input.website,
        websiteHash,
        metadataHash,
        projectType: input.projectType,
        description: input.description,
        ownerWallet: input.ownerWallet,
        maskedOwnerWallet: maskWallet(input.ownerWallet),
      },
    });

    try {
      const onChain = await registerProjectOnChain({
        name: input.name,
        slug: input.slug,
        websiteHash,
        metadataHash,
      });

      const updatedProject = await prisma.project.update({
        where: { slug: input.slug },
        data: {
          onChainProjectId: onChain.projectId,
          onChainRegistrationTx: onChain.transactionHash,
          onChainStatus: "registered",
        },
      });

      return {
        project: updatedProject,
        onChain: {
          status: "registered",
          ...onChain,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "On-chain registration failed";
      const updatedProject = await prisma.project.update({
        where: { slug: input.slug },
        data: {
          onChainStatus: "failed",
        },
      });

      return {
        project: updatedProject,
        onChain: {
          status: "failed",
          message,
        },
      };
    }
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      throw new Error("Project slug already exists");
    }

    throw error;
  }
}

export async function getProjectBySlug(slug: string) {
  return prisma.project.findUnique({
    where: { slug },
  });
}

export async function getProjectProfileBySlug(slug: string) {
  const project = await getProjectBySlug(slug);

  if (!project) {
    return undefined;
  }

  const onChain = {
    registered: false,
    status: project.onChainStatus ?? "not_checked",
    projectId: project.onChainProjectId,
    registrationTx: project.onChainRegistrationTx,
    message: undefined as string | undefined,
    project: undefined as Awaited<ReturnType<typeof getProjectOnChain>> | undefined,
  };
  let proofStatus: Awaited<ReturnType<typeof getLatestProofStatusOnChain>> = {
    hasProof: false,
    reason: "No proof result found",
  };

  try {
    const { exists: registered } = await projectExistsOnChain(slug);
    onChain.registered = registered;
    onChain.status = registered ? "registered" : "not_registered";

    if (registered) {
      onChain.project = await getProjectOnChain(slug);
    }

    proofStatus = await getLatestProofStatusOnChain(slug);
  } catch (error) {
    onChain.status = "unavailable";
    onChain.message = error instanceof Error ? error.message : "On-chain lookup failed";
    proofStatus = {
      hasProof: false,
      reason: onChain.message,
    };
  }

  return {
    project,
    onChain,
    proofStatus,
  };
}
