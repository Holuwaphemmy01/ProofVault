import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ProofVaultRegistry", function () {
  async function deployRegistry() {
    const [owner, other] = await ethers.getSigners();
    const ProofVaultRegistry = await ethers.getContractFactory("ProofVaultRegistry");
    const registry = await ProofVaultRegistry.deploy();

    return { registry, owner, other };
  }

  it("registers a project", async function () {
    const { registry, owner } = await deployRegistry();

    const tx = await registry.registerProject("ProofVault Demo", "proofvault-demo");
    const receipt = await tx.wait();
    const project = await registry.getProjectBySlug("proofvault-demo");

    expect(receipt?.status).to.equal(1);
    expect(project.name).to.equal("ProofVault Demo");
    expect(project.slug).to.equal("proofvault-demo");
    expect(project.owner).to.equal(owner.address);
    expect(project.exists).to.equal(true);
    expect(project.createdAt).to.be.greaterThan(0);
    expect(await registry.projectExists("proofvault-demo")).to.equal(true);
  });

  it("rejects duplicate project registration", async function () {
    const { registry } = await deployRegistry();

    await registry.registerProject("ProofVault Demo", "proofvault-demo");

    await expect(
      registry.registerProject("ProofVault Duplicate", "proofvault-demo"),
    ).to.be.revertedWith("Project already exists");
  });

  it("allows a project owner to submit a proof result", async function () {
    const { registry, owner } = await deployRegistry();
    const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proofvault-proof-result"));

    await registry.registerProject("ProofVault Demo", "proofvault-demo");
    await expect(
      registry.submitProofResult(
        "proofvault-demo",
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
        ethers.keccak256(ethers.toUtf8Bytes("proofvault-demo")),
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

    await registry.registerProject("ProofVault Demo", "proofvault-demo");

    await expect(
      registry.connect(other).submitProofResult(
        "proofvault-demo",
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

    await registry.registerProject("ProofVault Demo", "proofvault-demo");
    const project = await registry.getProjectBySlug("proofvault-demo");

    expect(project.name).to.equal("ProofVault Demo");
    expect(project.slug).to.equal("proofvault-demo");
    expect(project.owner).to.equal(owner.address);
    expect(project.exists).to.equal(true);
  });

  it("reads a proof result", async function () {
    const { registry, owner } = await deployRegistry();
    const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proofvault-proof-result"));

    await registry.registerProject("ProofVault Demo", "proofvault-demo");
    await registry.submitProofResult(
      "proofvault-demo",
      proofHash,
      true,
      "passed",
      "BTC,FLR",
      "ipfs://proofvault-demo-metadata",
    );

    const proofResult = await registry.getProofResult(1);

    expect(proofResult.id).to.equal(1);
    expect(proofResult.projectId).to.equal(ethers.keccak256(ethers.toUtf8Bytes("proofvault-demo")));
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

    await registry.registerProject("ProofVault Demo", "proofvault-demo");
    await registry.submitProofResult("proofvault-demo", firstProofHash, true, "passed", "BTC,FLR", "");
    await registry.submitProofResult("proofvault-demo", secondProofHash, false, "failed", "BTC,FLR", "");

    const proofIds = await registry.getProjectProofIds("proofvault-demo");

    expect(proofIds).to.deep.equal([1n, 2n]);
  });
});
