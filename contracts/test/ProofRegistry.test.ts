import { expect } from "chai";
import { ethers } from "hardhat";

describe("ProofRegistry", function () {
  it("stores and reads a proof record", async function () {
    const [creator] = await ethers.getSigners();
    const ProofRegistry = await ethers.getContractFactory("ProofRegistry");
    const proofRegistry = await ProofRegistry.deploy();
    const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proofvault-demo-proof"));

    await proofRegistry.storeProof("ProofVault Demo", proofHash, "passed");

    const proof = await proofRegistry.getProof(1);

    expect(proof.projectName).to.equal("ProofVault Demo");
    expect(proof.proofHash).to.equal(proofHash);
    expect(proof.status).to.equal("passed");
    expect(proof.creator).to.equal(creator.address);
    expect(proof.timestamp).to.be.greaterThan(0);
  });
});
