import crypto from "node:crypto";
import type { ProofJobInput } from "../schemas/proof-job.schema.js";
import type { PublicWorkerJob, StoredWorkerJob } from "../types/worker.types.js";

const jobs = new Map<string, StoredWorkerJob>();

export function createJob(input: ProofJobInput) {
  const now = new Date().toISOString();
  const job: StoredWorkerJob = {
    id: crypto.randomUUID(),
    proofRequestId: input.proofRequestId,
    projectSlug: input.projectSlug,
    status: "received",
    createdAt: now,
    updatedAt: now,
    input,
  };

  jobs.set(job.id, job);
  return toPublicJob(job);
}

export function updateJob(id: string, patch: Partial<PublicWorkerJob>) {
  const job = jobs.get(id);

  if (!job) {
    return undefined;
  }

  const updated: StoredWorkerJob = {
    ...job,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  jobs.set(id, updated);
  return toPublicJob(updated);
}

export function getJob(id: string) {
  const job = jobs.get(id);
  return job ? toPublicJob(job) : undefined;
}

export function toPublicJob(job: StoredWorkerJob): PublicWorkerJob {
  const { input: _input, ...publicJob } = job;
  return publicJob;
}
