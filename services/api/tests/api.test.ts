import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/services/contract.service.js", () => ({
  registerProjectOnChain: vi.fn(async () => ({
    transactionHash: "0xprojecttx",
    projectId: "0xprojectid",
    blockNumber: 1,
  })),
  createProofRequestOnChain: vi.fn(async () => ({
    transactionHash: "0xproofrequesttx",
    requestId: "1",
    blockNumber: 2,
  })),
  projectExistsOnChain: vi.fn(async () => ({ exists: true })),
  getProjectOnChain: vi.fn(async (slug: string) => ({
    name: "AtlasX Exchange",
    slug,
    websiteHash: "0xwebsitehash",
    metadataHash: "0xmetadatahash",
    owner: "0x92A7F13C00000000000000000000000000000000",
    exists: true,
    createdAt: "1",
    updatedAt: "1",
  })),
  getLatestProofStatusOnChain: vi.fn(async () => ({
    hasProof: false,
    reason: "No proof result found",
  })),
  getContractHealth: vi.fn(async () => ({
    connected: true,
    chainId: "31337",
    blockNumber: 1,
    registryAddress: "0x0000000000000000000000000000000000000001",
    contractReachable: true,
  })),
  getProjectProofHistoryOnChain: vi.fn(async (slug: string) => ({
    projectSlug: slug,
    proofResultIds: [],
    results: [],
  })),
  getProofRequestOnChain: vi.fn(async (requestId: string) => ({
    id: requestId,
    projectId: "0xprojectid",
    thresholdCommitment: "0xthreshold",
    selectedAssetsHash: "0xassets",
    selectedAssets: "BTC,FLR",
    metadataHash: "0xmetadata",
    createdBy: "0x92A7F13C00000000000000000000000000000000",
    createdAt: "1",
    status: "Created",
    exists: true,
  })),
  getProofResultOnChain: vi.fn(async (resultId: string) => ({
    id: resultId,
    requestId: "1",
    projectId: "0xprojectid",
    proofHash: "0xabc123",
    outcome: "PASS",
    thresholdMet: true,
    resultMetadataHash: "0xmetadata",
    submittedBy: "proofvault-worker",
    relayedBy: "proofvault-api",
    workerSignedAt: "1785747060",
    submittedAt: "1785747060",
    exists: true,
  })),
  getProofResultByRequestIdOnChain: vi.fn(async () => ({
    hasResult: false,
  })),
  readProjectRegisteredEvents: vi.fn(async () => []),
  readProofRequestCreatedEvents: vi.fn(async () => []),
  readProofResultSubmittedEvents: vi.fn(async () => []),
}));

const { buildApp } = await import("../src/app.js");
const { prisma } = await import("../src/lib/prisma.js");

const forbiddenPublicFields = [
  "rawBalance",
  "balanceUsdValue",
  "treasuryStrategy",
  "privateReserveComposition",
  "rawFdcPayload",
  "rawFtsoTrace",
  "fccComputationTrace",
  "relayerPrivateKey",
  "privateKey",
];

function createProjectPayload(slug = "atlasx-exchange") {
  return {
    name: "AtlasX Exchange",
    slug,
    website: "https://atlasx.exchange",
    projectType: "exchange",
    description: "Demo exchange using ProofVault",
    ownerWallet: "0x92A7F13C00000000000000000000000000000000",
  };
}

function createProofRequestPayload(projectSlug = "atlasx-exchange") {
  return {
    projectSlug,
    proofName: "July 2026 Reserve Verification",
    requiredThreshold: 1000000,
    thresholdCurrency: "USD",
    selectedAssets: ["BTC", "FLR"],
    privacyMode: "confidential_threshold_proof",
    walletReferences: [
      {
        assetSymbol: "BTC",
        chain: "bitcoin",
        sourceLabel: "BTC Reserve Source 1",
        encryptedWalletReference: "0xencryptedbtcwalletreference",
        walletAddressHash: "0xwalletaddresshashbtc",
        maskedWalletAddress: "bc1q...k42p",
        encryptionVersion: "proofvault-v1",
      },
      {
        assetSymbol: "FLR",
        chain: "flare",
        sourceLabel: "FLR Reserve Source 1",
        encryptedWalletReference: "0xencryptedflrwalletreference",
        walletAddressHash: "0xwalletaddresshashflr",
        maskedWalletAddress: "0x92A7...F13C",
        encryptionVersion: "proofvault-v1",
      },
    ],
  };
}

function createWorkerCallbackPayload(proofRequestId: string) {
  return {
    proofRequestId,
    status: "PASS",
    thresholdMet: true,
    proofHash: "0xabc123",
    workerSignedAt: 1785747060,
    signature: "0xsignature",
    verifiedWith: ["FDC_ADDRESS_VALIDITY", "FDC_PAYMENT", "FTSO", "FCC"],
  };
}

async function createProject(app: FastifyInstance, slug = "atlasx-exchange") {
  const response = await app.inject({
    method: "POST",
    url: "/projects",
    payload: createProjectPayload(slug),
  });

  return response.json();
}

async function createProofRequest(app: FastifyInstance, projectSlug = "atlasx-exchange") {
  const response = await app.inject({
    method: "POST",
    url: "/proof-requests",
    payload: createProofRequestPayload(projectSlug),
  });

  return response.json();
}

async function submitWorkerResult(app: FastifyInstance, proofRequestId: string) {
  const response = await app.inject({
    method: "POST",
    url: "/worker/callbacks/proof-result",
    payload: createWorkerCallbackPayload(proofRequestId),
  });

  return response.json();
}

function expectNoPrivateFields(payload: unknown) {
  const serialized = JSON.stringify(payload);

  for (const field of forbiddenPublicFields) {
    expect(serialized).not.toContain(field);
  }
}

describe("ProofVault API endpoints", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it("returns health status", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.service).toBe("proofvault-api");
    expect(body.timestamp).toBeTruthy();
  });

  it("creates a project", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/projects",
      payload: createProjectPayload(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(201);
    expect(body.success).toBe(true);
    expect(body.project.id).toBeTruthy();
    expect(body.project.slug).toBe("atlasx-exchange");
    expect(body.project.websiteHash).toBeTruthy();
    expect(body.project.metadataHash).toBeTruthy();
    expect(body.project.maskedOwnerWallet).toBeTruthy();
    expect(body.onChain.status).toBe("registered");
    expectNoPrivateFields(body);
  });

  it("rejects invalid project payloads", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/projects",
      payload: { slug: "atlasx-exchange" },
    });

    expect(response.statusCode).toBe(400);
  });

  it("rejects duplicate project slugs", async () => {
    await createProject(app);
    const response = await app.inject({
      method: "POST",
      url: "/projects",
      payload: createProjectPayload(),
    });
    const body = response.json();

    expect([400, 409]).toContain(response.statusCode);
    expect(body.error).toContain("Project slug already exists");
  });

  it("gets a project by slug", async () => {
    await createProject(app);
    const response = await app.inject({ method: "GET", url: "/projects/atlasx-exchange" });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.project.slug).toBe("atlasx-exchange");
    expect(body.project.maskedOwnerWallet).toBeTruthy();
    expect(body.proofStatus).toBeTruthy();
    expectNoPrivateFields(body);
  });

  it("returns 404 for a missing project", async () => {
    const response = await app.inject({ method: "GET", url: "/projects/non-existing-project" });

    expect(response.statusCode).toBe(404);
  });

  it("creates a proof request with encrypted wallet references", async () => {
    await createProject(app);
    const response = await app.inject({
      method: "POST",
      url: "/proof-requests",
      payload: createProofRequestPayload(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(201);
    expect(body.success).toBe(true);
    expect(body.proofRequest.id).toBeTruthy();
    expect(body.proofRequest.projectSlug).toBe("atlasx-exchange");
    expect(body.proofRequest.thresholdCommitment).toBeTruthy();
    expect(body.proofRequest.selectedAssetsHash).toBeTruthy();
    expect(body.proofRequest.metadataHash).toBeTruthy();
    expect(body.proofRequest.selectedAssets).toContain("BTC");
    expect(body.proofRequest.selectedAssets).toContain("FLR");
    expect(body.proofRequest.onChainStatus).toBe("created");
    expect(body.proofRequest.walletReferences).toHaveLength(2);
    expect(JSON.stringify(body)).not.toContain("encryptedWalletReference");
    expectNoPrivateFields(body);
  });

  it("returns 404 when creating a proof request for a missing project", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/proof-requests",
      payload: createProofRequestPayload("missing-project"),
    });

    expect(response.statusCode).toBe(404);
  });

  it.each([
    ["non-positive requiredThreshold", { requiredThreshold: 0 }],
    ["empty selectedAssets", { selectedAssets: [] }],
    ["empty walletReferences", { walletReferences: [] }],
    [
      "walletReference missing encryptedWalletReference",
      { walletReferences: [{ ...createProofRequestPayload().walletReferences[0], encryptedWalletReference: undefined }] },
    ],
    [
      "walletReference missing walletAddressHash",
      { walletReferences: [{ ...createProofRequestPayload().walletReferences[0], walletAddressHash: undefined }] },
    ],
  ])("rejects proof request validation errors: %s", async (_name, override) => {
    await createProject(app);
    const response = await app.inject({
      method: "POST",
      url: "/proof-requests",
      payload: {
        ...createProofRequestPayload(),
        ...override,
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it("gets a proof request by ID with safe wallet summaries", async () => {
    await createProject(app);
    const created = await createProofRequest(app);
    const response = await app.inject({
      method: "GET",
      url: `/proof-requests/${created.proofRequest.id}`,
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.proofRequest.id).toBe(created.proofRequest.id);
    expect(body.proofRequest.walletReferences).toHaveLength(2);
    expect(JSON.stringify(body)).not.toContain("encryptedWalletReference");
    expectNoPrivateFields(body);
  });

  it("returns 404 for a missing proof request", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/proof-requests/non-existing-id",
    });

    expect(response.statusCode).toBe(404);
  });

  it("lists proof requests for a project", async () => {
    await createProject(app);
    await createProofRequest(app);
    await createProofRequest(app);

    const response = await app.inject({
      method: "GET",
      url: "/projects/atlasx-exchange/proof-requests",
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.proofRequests.length).toBeGreaterThanOrEqual(2);
    expect(body.proofRequests.every((request: { projectSlug: string }) => request.projectSlug === "atlasx-exchange")).toBe(true);
  });

  it("accepts a worker proof result callback", async () => {
    await createProject(app);
    const created = await createProofRequest(app);
    const response = await app.inject({
      method: "POST",
      url: "/worker/callbacks/proof-result",
      payload: createWorkerCallbackPayload(created.proofRequest.id),
    });
    const body = response.json();
    const storedRequest = await prisma.proofRequest.findUnique({
      where: { id: created.proofRequest.id },
    });

    expect(response.statusCode).toBe(201);
    expect(body.success).toBe(true);
    expect(body.result.id).toBeTruthy();
    expect(storedRequest?.status).toBe("completed");
  });

  it("returns 404 for worker callback with invalid proof request", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/worker/callbacks/proof-result",
      payload: createWorkerCallbackPayload("non-existing-id"),
    });

    expect(response.statusCode).toBe(404);
  });

  it("gets the public latest proof result", async () => {
    await createProject(app);
    const created = await createProofRequest(app);
    await submitWorkerResult(app, created.proofRequest.id);

    const response = await app.inject({
      method: "GET",
      url: "/public/projects/atlasx-exchange/latest-proof",
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.project.slug).toBe("atlasx-exchange");
    expect(body.proofResult.projectSlug).toBe("atlasx-exchange");
    expect(body.proofResult.outcome).toBe("PASS");
    expect(body.proofResult.thresholdMet).toBe(true);
    expect(body.proofResult.proofHash).toBe("0xabc123");
    expect(body.proofResult.verifiedWith).toContain("FTSO");
    expect(body.proofResult.submittedAt).toBeTruthy();
    expectNoPrivateFields(body);
  });

  it("returns 404 when no public latest proof exists", async () => {
    await createProject(app, "project-without-proof");
    const response = await app.inject({
      method: "GET",
      url: "/public/projects/project-without-proof/latest-proof",
    });

    expect(response.statusCode).toBe(404);
  });

  it("serves OpenAPI JSON for documented routes", async () => {
    const response = await app.inject({ method: "GET", url: "/docs/json" });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.openapi).toBeTruthy();
    expect(body.paths["/projects"]).toBeTruthy();
    expect(body.paths["/proof-requests"]).toBeTruthy();
  });
});
