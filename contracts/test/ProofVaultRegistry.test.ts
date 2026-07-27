import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ProofVaultRegistry", function () {
  const projectName = "AtlasX Exchange";
  const projectSlug = "atlasx-exchange";
  const websiteHash = ethers.keccak256(ethers.toUtf8Bytes("https://atlasx.exchange"));
  const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://atlasx-project-metadata"));
  const selectedAssets = "BTC,FLR";
  const thresholdCommitment = ethers.keccak256(
    ethers.toUtf8Bytes("atlasx-exchange:1000000:USD:private-salt"),
  );
  const selectedAssetsHash = ethers.keccak256(ethers.toUtf8Bytes(selectedAssets));
  const proofRequestMetadataHash = ethers.keccak256(
    ethers.toUtf8Bytes('{"project":"atlasx-exchange","proofType":"reserve-threshold"}'),
  );
  const passProofHash = ethers.keccak256(ethers.toUtf8Bytes("atlasx-proof-result-pass"));
  const failProofHash = ethers.keccak256(ethers.toUtf8Bytes("atlasx-proof-result-fail"));
  const resultMetadataHash = ethers.keccak256(
    ethers.toUtf8Bytes('{"requestId":1,"source":"proofvault-worker"}'),
  );

  async function deployRegistry() {
    const [owner, worker, other] = await ethers.getSigners();
    const ProofVaultRegistry = await ethers.getContractFactory("ProofVaultRegistry");
    const registry = await ProofVaultRegistry.deploy();

    return { registry, owner, worker, other };
  }

  async function registerDefaultProject(registry: Awaited<ReturnType<typeof deployRegistry>>["registry"]) {
    return registry.registerProject(projectName, projectSlug, websiteHash, metadataHash);
  }

  async function createDefaultProofRequest(registry: Awaited<ReturnType<typeof deployRegistry>>["registry"]) {
    return registry.createProofRequest(
      projectSlug,
      thresholdCommitment,
      selectedAssets,
      selectedAssetsHash,
      proofRequestMetadataHash,
    );
  }

  async function registerProjectAndCreateRequest(
    registry: Awaited<ReturnType<typeof deployRegistry>>["registry"],
  ) {
    await registerDefaultProject(registry);
    await createDefaultProofRequest(registry);
  }

  async function authorizeWorker(
    registry: Awaited<ReturnType<typeof deployRegistry>>["registry"],
    workerAddress: string,
  ) {
    return registry.setWorkerSigner(workerAddress, true);
  }

  it("sets contract owner to the deployer", async function () {
    const { registry, owner } = await deployRegistry();

    expect(await registry.contractOwner()).to.equal(owner.address);
  });

  it("allows the contract owner to authorize a worker signer", async function () {
    const { registry, worker } = await deployRegistry();

    await expect(authorizeWorker(registry, worker.address))
      .to.emit(registry, "WorkerSignerUpdated")
      .withArgs(worker.address, true, anyValue);

    expect(await registry.isAuthorizedWorkerSigner(worker.address)).to.equal(true);
  });

  it("rejects worker signer authorization by a non-owner", async function () {
    const { registry, worker, other } = await deployRegistry();

    await expect(
      registry.connect(other).setWorkerSigner(worker.address, true),
    ).to.be.revertedWith("Only contract owner");
  });

  it("rejects authorizing address zero as a worker signer", async function () {
    const { registry } = await deployRegistry();

    await expect(
      registry.setWorkerSigner(ethers.ZeroAddress, true),
    ).to.be.revertedWith("Worker signer required");
  });

  it("registers a project", async function () {
    const { registry, owner } = await deployRegistry();

    const tx = await registerDefaultProject(registry);
    const receipt = await tx.wait();
    const project = await registry.getProjectBySlug(projectSlug);

    expect(receipt?.status).to.equal(1);
    expect(project.name).to.equal(projectName);
    expect(project.slug).to.equal(projectSlug);
    expect(project.websiteHash).to.equal(websiteHash);
    expect(project.metadataHash).to.equal(metadataHash);
    expect(project.owner).to.equal(owner.address);
    expect(project.exists).to.equal(true);
    expect(project.createdAt).to.be.greaterThan(0);
    expect(project.updatedAt).to.equal(project.createdAt);
    expect(await registry.projectExists(projectSlug)).to.equal(true);
  });

  it("rejects duplicate project registration", async function () {
    const { registry } = await deployRegistry();

    await registerDefaultProject(registry);

    await expect(
      registry.registerProject("ProofVault Duplicate", projectSlug, websiteHash, metadataHash),
    ).to.be.revertedWith("Project already exists");
  });

  it("rejects an empty project name", async function () {
    const { registry } = await deployRegistry();

    await expect(
      registry.registerProject("", projectSlug, websiteHash, metadataHash),
    ).to.be.revertedWith("Project name required");
  });

  it("rejects an empty project slug", async function () {
    const { registry } = await deployRegistry();

    await expect(
      registry.registerProject(projectName, "", websiteHash, metadataHash),
    ).to.be.revertedWith("Project slug required");
  });

  it("rejects a zero website hash", async function () {
    const { registry } = await deployRegistry();

    await expect(
      registry.registerProject(projectName, projectSlug, ethers.ZeroHash, metadataHash),
    ).to.be.revertedWith("Website hash required");
  });

  it("rejects a zero metadata hash", async function () {
    const { registry } = await deployRegistry();

    await expect(
      registry.registerProject(projectName, projectSlug, websiteHash, ethers.ZeroHash),
    ).to.be.revertedWith("Metadata hash required");
  });

  it("allows a project owner to create a proof request", async function () {
    const { registry, owner } = await deployRegistry();
    const projectId = ethers.keccak256(ethers.toUtf8Bytes(projectSlug));

    await registerDefaultProject(registry);

    await expect(createDefaultProofRequest(registry))
      .to.emit(registry, "ProofRequestCreated")
      .withArgs(
        1,
        projectId,
        thresholdCommitment,
        selectedAssetsHash,
        selectedAssets,
        proofRequestMetadataHash,
        owner.address,
        anyValue,
      );

    const proofRequest = await registry.getProofRequest(1);

    expect(proofRequest.id).to.equal(1);
    expect(proofRequest.projectId).to.equal(projectId);
    expect(proofRequest.thresholdCommitment).to.equal(thresholdCommitment);
    expect(proofRequest.selectedAssetsHash).to.equal(selectedAssetsHash);
    expect(proofRequest.selectedAssets).to.equal(selectedAssets);
    expect(proofRequest.metadataHash).to.equal(proofRequestMetadataHash);
    expect(proofRequest.createdBy).to.equal(owner.address);
    expect(proofRequest.createdAt).to.be.greaterThan(0);
    expect(proofRequest.status).to.equal(0);
    expect(proofRequest.exists).to.equal(true);
  });

  it("rejects proof request creation by a non-owner", async function () {
    const { registry, other } = await deployRegistry();

    await registerDefaultProject(registry);

    await expect(
      registry.connect(other).createProofRequest(
        projectSlug,
        thresholdCommitment,
        selectedAssets,
        selectedAssetsHash,
        proofRequestMetadataHash,
      ),
    ).to.be.revertedWith("Only project owner can create request");
  });

  it("rejects proof request creation for a non-existing project", async function () {
    const { registry } = await deployRegistry();

    await expect(
      registry.createProofRequest(
        projectSlug,
        thresholdCommitment,
        selectedAssets,
        selectedAssetsHash,
        proofRequestMetadataHash,
      ),
    ).to.be.revertedWith("Project does not exist");
  });

  it("rejects a zero threshold commitment", async function () {
    const { registry } = await deployRegistry();

    await registerDefaultProject(registry);

    await expect(
      registry.createProofRequest(
        projectSlug,
        ethers.ZeroHash,
        selectedAssets,
        selectedAssetsHash,
        proofRequestMetadataHash,
      ),
    ).to.be.revertedWith("Threshold commitment required");
  });

  it("rejects empty selected assets", async function () {
    const { registry } = await deployRegistry();

    await registerDefaultProject(registry);

    await expect(
      registry.createProofRequest(
        projectSlug,
        thresholdCommitment,
        "",
        selectedAssetsHash,
        proofRequestMetadataHash,
      ),
    ).to.be.revertedWith("Selected assets required");
  });

  it("rejects a zero selected assets hash", async function () {
    const { registry } = await deployRegistry();

    await registerDefaultProject(registry);

    await expect(
      registry.createProofRequest(
        projectSlug,
        thresholdCommitment,
        selectedAssets,
        ethers.ZeroHash,
        proofRequestMetadataHash,
      ),
    ).to.be.revertedWith("Selected assets hash required");
  });

  it("rejects a selected assets hash mismatch", async function () {
    const { registry } = await deployRegistry();
    const mismatchedAssetsHash = ethers.keccak256(ethers.toUtf8Bytes("BTC,USDC"));

    await registerDefaultProject(registry);

    await expect(
      registry.createProofRequest(
        projectSlug,
        thresholdCommitment,
        selectedAssets,
        mismatchedAssetsHash,
        proofRequestMetadataHash,
      ),
    ).to.be.revertedWith("Selected assets hash mismatch");
  });

  it("rejects a zero proof request metadata hash", async function () {
    const { registry } = await deployRegistry();

    await registerDefaultProject(registry);

    await expect(
      registry.createProofRequest(
        projectSlug,
        thresholdCommitment,
        selectedAssets,
        selectedAssetsHash,
        ethers.ZeroHash,
      ),
    ).to.be.revertedWith("Metadata hash required");
  });

  it("reads stored proof request IDs for a project", async function () {
    const { registry } = await deployRegistry();

    await registerDefaultProject(registry);
    await createDefaultProofRequest(registry);

    const requestIds = await registry.getProjectProofRequestIds(projectSlug);

    expect(requestIds).to.deep.equal([1n]);
  });

  it("increases proof request count after request creation", async function () {
    const { registry } = await deployRegistry();

    await registerDefaultProject(registry);
    expect(await registry.getProofRequestCount()).to.equal(0);

    await createDefaultProofRequest(registry);

    expect(await registry.getProofRequestCount()).to.equal(1);
  });

  it("allows an authorized worker signer to submit a PASS proof result", async function () {
    const { registry, worker } = await deployRegistry();
    const projectId = ethers.keccak256(ethers.toUtf8Bytes(projectSlug));

    await registerProjectAndCreateRequest(registry);
    await authorizeWorker(registry, worker.address);

    await expect(
      registry.connect(worker).submitProofResult(
        1,
        passProofHash,
        0,
        resultMetadataHash,
      ),
    )
      .to.emit(registry, "ProofResultSubmitted")
      .withArgs(
        1,
        1,
        projectId,
        passProofHash,
        0,
        true,
        resultMetadataHash,
        worker.address,
        anyValue,
      );

    const proofResult = await registry.getProofResult(1);
    const proofRequest = await registry.getProofRequest(1);

    expect(proofResult.thresholdMet).to.equal(true);
    expect(proofResult.outcome).to.equal(0);
    expect(proofRequest.status).to.equal(2);
  });

  it("allows an authorized worker signer to submit a FAIL proof result", async function () {
    const { registry, worker } = await deployRegistry();

    await registerProjectAndCreateRequest(registry);
    await authorizeWorker(registry, worker.address);

    await registry.connect(worker).submitProofResult(1, failProofHash, 1, resultMetadataHash);

    const proofResult = await registry.getProofResult(1);

    expect(proofResult.thresholdMet).to.equal(false);
    expect(proofResult.outcome).to.equal(1);
  });

  it("rejects proof result submission by a non-authorized signer", async function () {
    const { registry, other } = await deployRegistry();

    await registerProjectAndCreateRequest(registry);

    await expect(
      registry.connect(other).submitProofResult(
        1,
        passProofHash,
        0,
        resultMetadataHash,
      ),
    ).to.be.revertedWith("Only authorized worker signer");
  });

  it("rejects proof result submission for a non-existing request", async function () {
    const { registry, worker } = await deployRegistry();

    await authorizeWorker(registry, worker.address);

    await expect(
      registry.connect(worker).submitProofResult(99, passProofHash, 0, resultMetadataHash),
    ).to.be.revertedWith("Proof request does not exist");
  });

  it("rejects a zero proof hash", async function () {
    const { registry, worker } = await deployRegistry();

    await registerProjectAndCreateRequest(registry);
    await authorizeWorker(registry, worker.address);

    await expect(
      registry.connect(worker).submitProofResult(1, ethers.ZeroHash, 0, resultMetadataHash),
    ).to.be.revertedWith("Proof hash required");
  });

  it("rejects a zero result metadata hash", async function () {
    const { registry, worker } = await deployRegistry();

    await registerProjectAndCreateRequest(registry);
    await authorizeWorker(registry, worker.address);

    await expect(
      registry.connect(worker).submitProofResult(1, passProofHash, 0, ethers.ZeroHash),
    ).to.be.revertedWith("Result metadata hash required");
  });

  it("rejects duplicate proof results for the same request", async function () {
    const { registry, worker } = await deployRegistry();

    await registerProjectAndCreateRequest(registry);
    await authorizeWorker(registry, worker.address);
    await registry.connect(worker).submitProofResult(1, passProofHash, 0, resultMetadataHash);

    await expect(
      registry.connect(worker).submitProofResult(1, failProofHash, 1, resultMetadataHash),
    ).to.be.revertedWith("Proof result already submitted");
  });

  it("reads a project by slug", async function () {
    const { registry, owner } = await deployRegistry();

    await registerDefaultProject(registry);
    const project = await registry.getProjectBySlug(projectSlug);

    expect(project.name).to.equal(projectName);
    expect(project.slug).to.equal(projectSlug);
    expect(project.websiteHash).to.equal(websiteHash);
    expect(project.metadataHash).to.equal(metadataHash);
    expect(project.owner).to.equal(owner.address);
    expect(project.exists).to.equal(true);
  });

  it("reads a stored proof result by result ID", async function () {
    const { registry, worker } = await deployRegistry();

    await registerProjectAndCreateRequest(registry);
    await authorizeWorker(registry, worker.address);
    await registry.connect(worker).submitProofResult(1, passProofHash, 0, resultMetadataHash);

    const proofResult = await registry.getProofResult(1);
    expect(proofResult.id).to.equal(1);
    expect(proofResult.requestId).to.equal(1);
    expect(proofResult.projectId).to.equal(ethers.keccak256(ethers.toUtf8Bytes(projectSlug)));
    expect(proofResult.proofHash).to.equal(passProofHash);
    expect(proofResult.outcome).to.equal(0);
    expect(proofResult.thresholdMet).to.equal(true);
    expect(proofResult.resultMetadataHash).to.equal(resultMetadataHash);
    expect(proofResult.submittedBy).to.equal(worker.address);
    expect(proofResult.submittedAt).to.be.greaterThan(0);
    expect(proofResult.exists).to.equal(true);
  });

  it("reads a stored proof result by request ID", async function () {
    const { registry, worker } = await deployRegistry();

    await registerProjectAndCreateRequest(registry);
    await authorizeWorker(registry, worker.address);
    await registry.connect(worker).submitProofResult(1, passProofHash, 0, resultMetadataHash);

    const proofResult = await registry.getProofResultByRequestId(1);

    expect(proofResult.id).to.equal(1);
    expect(proofResult.requestId).to.equal(1);
    expect(proofResult.proofHash).to.equal(passProofHash);
  });

  it("increases proof result count after submission", async function () {
    const { registry, worker } = await deployRegistry();

    await registerProjectAndCreateRequest(registry);
    await authorizeWorker(registry, worker.address);

    expect(await registry.getProofResultCount()).to.equal(0);

    await registry.connect(worker).submitProofResult(1, passProofHash, 0, resultMetadataHash);

    expect(await registry.getProofResultCount()).to.equal(1);
  });
});
