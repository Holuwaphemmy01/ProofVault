import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { WorkerProofResultInput } from "../schemas/worker-callback.schema.js";

function sha256(value: string) {
  return `0x${crypto.createHash("sha256").update(value).digest("hex")}`;
}

function getResultMetadataHash(input: WorkerProofResultInput) {
  return input.resultMetadataHash ?? sha256(JSON.stringify({
    proofRequestId: input.proofRequestId,
    status: input.status,
    verifiedWith: input.verifiedWith,
  }));
}

function toPrismaJson(value: WorkerProofResultInput["receipt"]) {
  return value as Prisma.InputJsonValue | undefined;
}

export async function receiveWorkerProofResult(input: WorkerProofResultInput) {
  const proofRequest = await prisma.proofRequest.findUnique({
    where: { id: input.proofRequestId },
  });

  if (!proofRequest) {
    return undefined;
  }

  return prisma.$transaction(async (tx) => {
    const db = tx as typeof prisma;

    await db.workerCallback.create({
      data: {
        proofRequestId: input.proofRequestId,
        status: input.status,
        payloadHash: sha256(JSON.stringify({
          proofRequestId: input.proofRequestId,
          status: input.status,
          thresholdMet: input.thresholdMet,
          proofHash: input.proofHash,
          resultMetadataHash: input.resultMetadataHash,
          workerSignedAt: input.workerSignedAt,
          verifiedWith: input.verifiedWith,
          receipt: input.receipt,
        })),
        processed: true,
      },
    });

    const resultMetadataHash = getResultMetadataHash(input);

    const result = await db.proofResult.upsert({
      where: { proofRequestId: input.proofRequestId },
      update: {
        outcome: input.status,
        thresholdMet: input.thresholdMet,
        proofHash: input.proofHash,
        resultMetadataHash,
        workerSignedAt: new Date(input.workerSignedAt * 1000),
        submittedBy: "proofvault-worker",
        verifiedWith: input.verifiedWith,
        receipt: toPrismaJson(input.receipt),
      },
      create: {
        projectId: proofRequest.projectId,
        projectSlug: proofRequest.projectSlug,
        proofRequestId: proofRequest.id,
        outcome: input.status,
        thresholdMet: input.thresholdMet,
        proofHash: input.proofHash,
        resultMetadataHash,
        workerSignedAt: new Date(input.workerSignedAt * 1000),
        submittedBy: "proofvault-worker",
        verifiedWith: input.verifiedWith,
        receipt: toPrismaJson(input.receipt),
      },
    });

    await db.proofRequest.update({
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
