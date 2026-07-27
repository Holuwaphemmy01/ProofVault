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

  async function deployRegistry() {
    const [owner, other] = await ethers.getSigners();
    const ProofVaultRegistry = await ethers.getContractFactory("ProofVaultRegistry");
    const registry = await ProofVaultRegistry.deploy();

    return { registry, owner, other };
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

  it("allows a project owner to submit a proof result", async function () {
    const { registry, owner } = await deployRegistry();
    const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proofvault-proof-result"));

    await registerDefaultProject(registry);
    await expect(
      registry.submitProofResult(
        projectSlug,
        proofHash,
        true,
        "passed",
        "BTC,FLR",
        "ipfs://proofvault-demo-metadata",
      ),
    )
      .to.emit(registry, "ProofResultSubmitted")
      .withArgs(
        1,
        ethers.keccak256(ethers.toUtf8Bytes(projectSlug)),
        proofHash,
        true,
        "passed",
        anyValue,
      );

    expect(await registry.getProofCount()).to.equal(1);
  });

  it("rejects proof result submission by a non-owner", async function () {
    const { registry, other } = await deployRegistry();
    const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proofvault-proof-result"));

    await registerDefaultProject(registry);

    await expect(
      registry.connect(other).submitProofResult(
        projectSlug,
        proofHash,
        true,
        "passed",
        "BTC,FLR",
        "ipfs://proofvault-demo-metadata",
      ),
    ).to.be.revertedWith("Only project owner can submit proof");
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

  it("reads a proof result", async function () {
    const { registry, owner } = await deployRegistry();
    const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proofvault-proof-result"));

    await registerDefaultProject(registry);
    await registry.submitProofResult(
      projectSlug,
      proofHash,
      true,
      "passed",
      "BTC,FLR",
      "ipfs://proofvault-demo-metadata",
    );

    const proofResult = await registry.getProofResult(1);

    expect(proofResult.id).to.equal(1);
    expect(proofResult.projectId).to.equal(ethers.keccak256(ethers.toUtf8Bytes(projectSlug)));
    expect(proofResult.proofHash).to.equal(proofHash);
    expect(proofResult.thresholdMet).to.equal(true);
    expect(proofResult.status).to.equal("passed");
    expect(proofResult.supportedAssets).to.equal("BTC,FLR");
    expect(proofResult.metadataUri).to.equal("ipfs://proofvault-demo-metadata");
    expect(proofResult.submittedBy).to.equal(owner.address);
    expect(proofResult.timestamp).to.be.greaterThan(0);
  });

  it("reads project proof IDs", async function () {
    const { registry } = await deployRegistry();
    const firstProofHash = ethers.keccak256(ethers.toUtf8Bytes("proofvault-proof-result-1"));
    const secondProofHash = ethers.keccak256(ethers.toUtf8Bytes("proofvault-proof-result-2"));

    await registerDefaultProject(registry);
    await registry.submitProofResult(projectSlug, firstProofHash, true, "passed", "BTC,FLR", "");
    await registry.submitProofResult(projectSlug, secondProofHash, false, "failed", "BTC,FLR", "");

    const proofIds = await registry.getProjectProofIds(projectSlug);

    expect(proofIds).to.deep.equal([1n, 2n]);
  });
});
