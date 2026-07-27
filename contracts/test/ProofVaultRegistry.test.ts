import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ProofVaultRegistry", function () {
  const projectName = "AtlasX Exchange";
  const projectSlug = "atlasx-exchange";
  const websiteHash = ethers.keccak256(ethers.toUtf8Bytes("https://atlasx.exchange"));
  const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://atlasx-project-metadata"));

  async function deployRegistry() {
    const [owner, other] = await ethers.getSigners();
    const ProofVaultRegistry = await ethers.getContractFactory("ProofVaultRegistry");
    const registry = await ProofVaultRegistry.deploy();

    return { registry, owner, other };
  }

  async function registerDefaultProject(registry: Awaited<ReturnType<typeof deployRegistry>>["registry"]) {
    return registry.registerProject(projectName, projectSlug, websiteHash, metadataHash);
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
