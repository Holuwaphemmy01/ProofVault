import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";
import type { WorkerProofResultInput } from "../schemas/worker-callback.schema.js";

function sha256(value: string) {
  return `0x${crypto.createHash("sha256").update(value).digest("hex")}`;
}

export async function receiveWorkerProofResult(input: WorkerProofResultInput) {
  const proofRequest = await prisma.proofRequest.findUnique({
    where: { id: input.proofRequestId },
  });

  if (!proofRequest) {
    return undefined;
  }

  return prisma.$transaction(async (tx) => {
    await tx.workerCallback.create({
      data: {
        proofRequestId: input.proofRequestId,
        status: input.status,
        payloadHash: sha256(JSON.stringify({
          proofRequestId: input.proofRequestId,
          status: input.status,
          thresholdMet: input.thresholdMet,
          proofHash: input.proofHash,
          workerSignedAt: input.workerSignedAt,
          verifiedWith: input.verifiedWith,
        })),
        processed: true,
      },
    });

    const result = await tx.proofResult.upsert({
      where: { proofRequestId: input.proofRequestId },
      update: {
        outcome: input.status,
        thresholdMet: input.thresholdMet,
        proofHash: input.proofHash,
        resultMetadataHash: sha256(JSON.stringify({
          proofRequestId: input.proofRequestId,
          status: input.status,
          verifiedWith: input.verifiedWith,
        })),
        workerSignedAt: new Date(input.workerSignedAt * 1000),
        submittedBy: "proofvault-worker",
        verifiedWith: input.verifiedWith,
      },
      create: {
        projectId: proofRequest.projectId,
        projectSlug: proofRequest.projectSlug,
        proofRequestId: proofRequest.id,
        outcome: input.status,
        thresholdMet: input.thresholdMet,
        proofHash: input.proofHash,
        resultMetadataHash: sha256(JSON.stringify({
          proofRequestId: input.proofRequestId,
          status: input.status,
          verifiedWith: input.verifiedWith,
        })),
        workerSignedAt: new Date(input.workerSignedAt * 1000),
        submittedBy: "proofvault-worker",
        verifiedWith: input.verifiedWith,
      },
    });

    await tx.proofRequest.update({
      where: { id: proofRequest.id },
      data: {
        status: input.status === "PASS" || input.status === "FAIL" ? "completed" : proofRequest.status,
      },
    });

    return result;
  });
}

export async function getLatestProofResultByProjectSlug(projectSlug: string) {
  return prisma.proofResult.findFirst({
    where: { projectSlug },
    orderBy: { submittedAt: "desc" },
  });
}
