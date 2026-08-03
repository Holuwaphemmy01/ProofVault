import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";
import type { CreateProofRequestInput } from "../schemas/proof-request.schema.js";

function sha256(value: string) {
  return `0x${crypto.createHash("sha256").update(value).digest("hex")}`;
}

export async function createProofRequest(input: CreateProofRequestInput) {
  const project = await prisma.project.findUnique({
    where: { slug: input.projectSlug },
  });

  if (!project) {
    return undefined;
  }

  return prisma.proofRequest.create({
    data: {
      projectId: project.id,
      projectSlug: input.projectSlug,
      proofName: input.proofName,
      requiredThreshold: input.requiredThreshold,
      thresholdCurrency: input.thresholdCurrency,
      thresholdCommitment: sha256(`${input.projectSlug}:${input.requiredThreshold}:${input.thresholdCurrency}:${input.privacyMode}`),
      selectedAssets: input.selectedAssets,
      selectedAssetsHash: sha256(input.selectedAssets.join(",")),
      privacyMode: input.privacyMode,
      metadataHash: sha256(JSON.stringify({
        projectSlug: input.projectSlug,
        proofName: input.proofName,
        selectedAssets: input.selectedAssets,
        privacyMode: input.privacyMode,
      })),
      status: "pending",
    },
  });
}

export async function getProofRequestById(id: string) {
  return prisma.proofRequest.findUnique({
    where: { id },
  });
}

export async function getProofRequestsByProjectSlug(projectSlug: string) {
  return prisma.proofRequest.findMany({
    where: { projectSlug },
    orderBy: { createdAt: "desc" },
  });
}
