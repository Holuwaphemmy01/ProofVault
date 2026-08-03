import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ProofVaultRegistry", function () {
  const projectName = "AtlasX Exchange";
  const projectSlug = "atlasx-exchange";
  const projectWebsite = "https://atlasx.exchange";
  const proofName = "July 2026 Reserve Verification";
  const selectedAssets = "BTC,FLR";
  const thresholdCommitmentSeed = "atlasx-exchange:1000000:USD:private-salt";
  const workerSignedAt = 1_785_000_000n;

  const websiteHash = ethers.keccak256(ethers.toUtf8Bytes(projectWebsite));
  const projectMetadataHash = ethers.keccak256(
    ethers.toUtf8Bytes('{"name":"AtlasX Exchange","type":"exchange"}'),
  );
  const thresholdCommitment = ethers.keccak256(ethers.toUtf8Bytes(thresholdCommitmentSeed));
  const selectedAssetsHash = ethers.keccak256(ethers.toUtf8Bytes(selectedAssets));
  const proofRequestMetadataHash = ethers.keccak256(
    ethers.toUtf8Bytes(`{"proofName":"${proofName}","project":"${projectSlug}"}`),
  );
  const resultMetadataHash = ethers.keccak256(
    ethers.toUtf8Bytes(`{"proofName":"${proofName}","source":"proofvault-worker"}`),
  );
  const passProofHash = ethers.keccak256(ethers.toUtf8Bytes("atlasx-proof-result-pass"));
  const failProofHash = ethers.keccak256(ethers.toUtf8Bytes("atlasx-proof-result-fail"));

  const projectId = ethers.keccak256(ethers.toUtf8Bytes(projectSlug));

  async function deployRegistryFixture() {
    const [deployer, workerSigner, relayer, other] = await ethers.getSigners();
    const ProofVaultRegistry = await ethers.getContractFactory("ProofVaultRegistry");
    const registry = await ProofVaultRegistry.deploy();

    return { registry, deployer, workerSigner, relayer, other };
  }

  async function registerDefaultProject(registry: Awaited<ReturnType<typeof deployRegistryFixture>>["registry"]) {
    return registry.registerProject(projectName, projectSlug, websiteHash, projectMetadataHash);
  }

  async function createDefaultProofRequest(
    registry: Awaited<ReturnType<typeof deployRegistryFixture>>["registry"],
  ) {
    return registry.createProofRequest(
      projectSlug,
      thresholdCommitment,
      selectedAssets,
      selectedAssetsHash,
      proofRequestMetadataHash,
    );
  }

  async function authorizeWorkerSigner(
    registry: Awaited<ReturnType<typeof deployRegistryFixture>>["registry"],
    signerAddress: string,
  ) {
    return registry.setWorkerSigner(signerAddress, true);
  }

  async function createProofResultSignature(
    registry: Awaited<ReturnType<typeof deployRegistryFixture>>["registry"],
    workerSigner: any,
    requestId = 1,
    proofHash = passProofHash,
    outcome = 0,
    signedAt = workerSignedAt,
    metadataHash = resultMetadataHash,
  ) {
    const messageHash = await registry.getProofResultMessageHash(
      requestId,
      proofHash,
      outcome,
      signedAt,
      metadataHash,
    );

    return workerSigner.signMessage(ethers.getBytes(messageHash));
  }

  async function submitDefaultProofResult(
    registry: Awaited<ReturnType<typeof deployRegistryFixture>>["registry"],
    workerSigner: any,
    relayer: any,
    requestId = 1,
    proofHash = passProofHash,
    outcome = 0,
  ) {
    const signature = await createProofResultSignature(
      registry,
      workerSigner,
      requestId,
      proofHash,
      outcome,
    );

    return registry.connect(relayer).submitProofResult(
      requestId,
      proofHash,
      outcome,
      resultMetadataHash,
      workerSignedAt,
      signature,
    );
  }

  async function setupRegisteredProject() {
    const context = await deployRegistryFixture();
    await registerDefaultProject(context.registry);
    return context;
  }

  async function setupProofRequest() {
    const context = await setupRegisteredProject();
    await createDefaultProofRequest(context.registry);
    return context;
  }

  async function setupAuthorizedProofRequest() {
    const context = await setupProofRequest();
    await authorizeWorkerSigner(context.registry, context.workerSigner.address);
    return context;
  }

  describe("Deployment", function () {
    it("sets contractOwner to the deployer", async function () {
      const { registry, deployer } = await deployRegistryFixture();

      expect(await registry.contractOwner()).to.equal(deployer.address);
    });

    it("starts proof request count at zero", async function () {
      const { registry } = await deployRegistryFixture();

      expect(await registry.getProofRequestCount()).to.equal(0);
    });

    it("starts proof result count at zero", async function () {
      const { registry } = await deployRegistryFixture();

      expect(await registry.getProofResultCount()).to.equal(0);
    });
  });

  describe("Project Registration", function () {
    it("registers a project successfully", async function () {
      const { registry, deployer } = await deployRegistryFixture();

      await registerDefaultProject(registry);
      const project = await registry.getProjectBySlug(projectSlug);

      expect(project.name).to.equal(projectName);
      expect(project.slug).to.equal(projectSlug);
      expect(project.owner).to.equal(deployer.address);
      expect(project.exists).to.equal(true);
      expect(project.createdAt).to.be.greaterThan(0);
      expect(project.updatedAt).to.equal(project.createdAt);
    });

    it("queries a project by slug", async function () {
      const { registry } = await setupRegisteredProject();

      const project = await registry.getProjectBySlug(projectSlug);

      expect(project.name).to.equal(projectName);
      expect(project.slug).to.equal(projectSlug);
    });

    it("saves the project owner correctly", async function () {
      const { registry, deployer } = await setupRegisteredProject();

      const project = await registry.getProjectBySlug(projectSlug);

      expect(project.owner).to.equal(deployer.address);
    });

    it("saves websiteHash correctly", async function () {
      const { registry } = await setupRegisteredProject();

      const project = await registry.getProjectBySlug(projectSlug);

      expect(project.websiteHash).to.equal(websiteHash);
    });

    it("saves metadataHash correctly", async function () {
      const { registry } = await setupRegisteredProject();

      const project = await registry.getProjectBySlug(projectSlug);

      expect(project.metadataHash).to.equal(projectMetadataHash);
    });

    it("projectExists returns true after registration", async function () {
      const { registry } = await setupRegisteredProject();

      expect(await registry.projectExists(projectSlug)).to.equal(true);
    });

    it("rejects duplicate slug registration", async function () {
      const { registry } = await setupRegisteredProject();

      await expect(
        registry.registerProject("AtlasX Duplicate", projectSlug, websiteHash, projectMetadataHash),
      ).to.be.revertedWith("Project already exists");
    });

    it("rejects an empty project name", async function () {
      const { registry } = await deployRegistryFixture();

      await expect(
        registry.registerProject("", projectSlug, websiteHash, projectMetadataHash),
      ).to.be.revertedWith("Project name required");
    });

    it("rejects an empty slug", async function () {
      const { registry } = await deployRegistryFixture();

      await expect(
        registry.registerProject(projectName, "", websiteHash, projectMetadataHash),
      ).to.be.revertedWith("Project slug required");
    });

    it("rejects a zero websiteHash", async function () {
      const { registry } = await deployRegistryFixture();

      await expect(
        registry.registerProject(projectName, projectSlug, ethers.ZeroHash, projectMetadataHash),
      ).to.be.revertedWith("Website hash required");
    });

    it("rejects a zero metadataHash", async function () {
      const { registry } = await deployRegistryFixture();

      await expect(
        registry.registerProject(projectName, projectSlug, websiteHash, ethers.ZeroHash),
      ).to.be.revertedWith("Metadata hash required");
    });

    it("emits ProjectRegistered", async function () {
      const { registry, deployer } = await deployRegistryFixture();

      await expect(registerDefaultProject(registry))
        .to.emit(registry, "ProjectRegistered")
        .withArgs(
          projectId,
          projectName,
          projectSlug,
          websiteHash,
          projectMetadataHash,
          deployer.address,
          anyValue,
        );
    });
  });

  describe("Proof Request Creation", function () {
    it("allows the project owner to create a proof request", async function () {
      const { registry, deployer } = await setupRegisteredProject();

      await createDefaultProofRequest(registry);
      const proofRequest = await registry.getProofRequest(1);

      expect(proofRequest.id).to.equal(1);
      expect(proofRequest.projectId).to.equal(projectId);
      expect(proofRequest.createdBy).to.equal(deployer.address);
      expect(proofRequest.status).to.equal(0);
      expect(proofRequest.exists).to.equal(true);
    });

    it("rejects proof request creation by a non-owner", async function () {
      const { registry, other } = await setupRegisteredProject();

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
      const { registry } = await deployRegistryFixture();

      await expect(createDefaultProofRequest(registry)).to.be.revertedWith("Project does not exist");
    });

    it("rejects a zero thresholdCommitment", async function () {
      const { registry } = await setupRegisteredProject();

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

    it("rejects empty selectedAssets", async function () {
      const { registry } = await setupRegisteredProject();

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

    it("rejects a zero selectedAssetsHash", async function () {
      const { registry } = await setupRegisteredProject();

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

    it("rejects selectedAssetsHash mismatch", async function () {
      const { registry } = await setupRegisteredProject();
      const mismatchedAssetsHash = ethers.keccak256(ethers.toUtf8Bytes("BTC,USDC"));

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

    it("rejects a zero metadataHash", async function () {
      const { registry } = await setupRegisteredProject();

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

    it("getProofRequest returns the stored request", async function () {
      const { registry, deployer } = await setupProofRequest();

      const proofRequest = await registry.getProofRequest(1);

      expect(proofRequest.id).to.equal(1);
      expect(proofRequest.projectId).to.equal(projectId);
      expect(proofRequest.thresholdCommitment).to.equal(thresholdCommitment);
      expect(proofRequest.selectedAssets).to.equal(selectedAssets);
      expect(proofRequest.selectedAssetsHash).to.equal(selectedAssetsHash);
      expect(proofRequest.metadataHash).to.equal(proofRequestMetadataHash);
      expect(proofRequest.createdBy).to.equal(deployer.address);
      expect(proofRequest.exists).to.equal(true);
    });

    it("getProjectProofRequestIds returns the request ID", async function () {
      const { registry } = await setupProofRequest();

      expect(await registry.getProjectProofRequestIds(projectSlug)).to.deep.equal([1n]);
    });

    it("getProofRequestCount increases after request creation", async function () {
      const { registry } = await setupRegisteredProject();

      expect(await registry.getProofRequestCount()).to.equal(0);
      await createDefaultProofRequest(registry);
      expect(await registry.getProofRequestCount()).to.equal(1);
    });

    it("emits ProofRequestCreated", async function () {
      const { registry, deployer } = await setupRegisteredProject();

      await expect(createDefaultProofRequest(registry))
        .to.emit(registry, "ProofRequestCreated")
        .withArgs(
          1,
          projectId,
          thresholdCommitment,
          selectedAssetsHash,
          selectedAssets,
          proofRequestMetadataHash,
          deployer.address,
          anyValue,
        );
    });
  });

  describe("Worker Signer Management", function () {
    it("allows the contract owner to authorize a worker signer", async function () {
      const { registry, workerSigner } = await deployRegistryFixture();

      await authorizeWorkerSigner(registry, workerSigner.address);

      expect(await registry.isAuthorizedWorkerSigner(workerSigner.address)).to.equal(true);
    });

    it("allows the contract owner to revoke a worker signer", async function () {
      const { registry, workerSigner } = await deployRegistryFixture();

      await authorizeWorkerSigner(registry, workerSigner.address);
      await registry.setWorkerSigner(workerSigner.address, false);

      expect(await registry.isAuthorizedWorkerSigner(workerSigner.address)).to.equal(false);
    });

    it("rejects worker signer authorization by a non-owner", async function () {
      const { registry, workerSigner, other } = await deployRegistryFixture();

      await expect(
        registry.connect(other).setWorkerSigner(workerSigner.address, true),
      ).to.be.revertedWith("Only contract owner");
    });

    it("rejects address(0) authorization", async function () {
      const { registry } = await deployRegistryFixture();

      await expect(registry.setWorkerSigner(ethers.ZeroAddress, true)).to.be.revertedWith(
        "Worker signer required",
      );
    });

    it("returns true for an authorized worker signer", async function () {
      const { registry, workerSigner } = await deployRegistryFixture();

      await authorizeWorkerSigner(registry, workerSigner.address);

      expect(await registry.isAuthorizedWorkerSigner(workerSigner.address)).to.equal(true);
    });

    it("returns false for an unauthorized worker signer", async function () {
      const { registry, workerSigner } = await deployRegistryFixture();

      expect(await registry.isAuthorizedWorkerSigner(workerSigner.address)).to.equal(false);
    });

    it("emits WorkerSignerUpdated", async function () {
      const { registry, workerSigner } = await deployRegistryFixture();

      await expect(authorizeWorkerSigner(registry, workerSigner.address))
        .to.emit(registry, "WorkerSignerUpdated")
        .withArgs(workerSigner.address, true, anyValue);
    });
  });

  describe("Proof Result Signature Verification", function () {
    it("accepts a valid authorized worker signature", async function () {
      const { registry, workerSigner, relayer } = await setupAuthorizedProofRequest();
      const signature = await createProofResultSignature(registry, workerSigner);

      await expect(
        registry.connect(relayer).submitProofResult(
          1,
          passProofHash,
          0,
          resultMetadataHash,
          workerSignedAt,
          signature,
        ),
      ).to.not.be.reverted;
    });

    it("rejects an invalid signature", async function () {
      const { registry, workerSigner } = await setupAuthorizedProofRequest();
      await authorizeWorkerSigner(registry, workerSigner.address);

      await expect(
        registry.submitProofResult(1, passProofHash, 0, resultMetadataHash, workerSignedAt, "0x1234"),
      ).to.be.reverted;
    });

    it("rejects a signature from an unauthorized signer", async function () {
      const { registry, other } = await setupProofRequest();
      const signature = await createProofResultSignature(registry, other);

      await expect(
        registry.submitProofResult(1, passProofHash, 0, resultMetadataHash, workerSignedAt, signature),
      ).to.be.revertedWith("Unauthorized worker signer");
    });

    it("rejects tampered requestId", async function () {
      const { registry, workerSigner } = await setupAuthorizedProofRequest();
      await createDefaultProofRequest(registry);
      const signature = await createProofResultSignature(registry, workerSigner, 1);

      await expect(
        registry.submitProofResult(2, passProofHash, 0, resultMetadataHash, workerSignedAt, signature),
      ).to.be.revertedWith("Unauthorized worker signer");
    });

    it("rejects tampered proofHash", async function () {
      const { registry, workerSigner } = await setupAuthorizedProofRequest();
      const signature = await createProofResultSignature(registry, workerSigner);
      const tamperedProofHash = ethers.keccak256(ethers.toUtf8Bytes("tampered-proof-hash"));

      await expect(
        registry.submitProofResult(1, tamperedProofHash, 0, resultMetadataHash, workerSignedAt, signature),
      ).to.be.revertedWith("Unauthorized worker signer");
    });

    it("rejects tampered outcome/status", async function () {
      const { registry, workerSigner } = await setupAuthorizedProofRequest();
      const signature = await createProofResultSignature(registry, workerSigner, 1, passProofHash, 0);

      await expect(
        registry.submitProofResult(1, passProofHash, 1, resultMetadataHash, workerSignedAt, signature),
      ).to.be.revertedWith("Unauthorized worker signer");
    });

    it("rejects tampered workerSignedAt timestamp", async function () {
      const { registry, workerSigner } = await setupAuthorizedProofRequest();
      const signature = await createProofResultSignature(registry, workerSigner);

      await expect(
        registry.submitProofResult(1, passProofHash, 0, resultMetadataHash, workerSignedAt + 1n, signature),
      ).to.be.revertedWith("Unauthorized worker signer");
    });

    it("rejects tampered resultMetadataHash", async function () {
      const { registry, workerSigner } = await setupAuthorizedProofRequest();
      const signature = await createProofResultSignature(registry, workerSigner);
      const tamperedMetadataHash = ethers.keccak256(ethers.toUtf8Bytes("tampered-result-metadata"));

      await expect(
        registry.submitProofResult(1, passProofHash, 0, tamperedMetadataHash, workerSignedAt, signature),
      ).to.be.revertedWith("Unauthorized worker signer");
    });

    it("rejects zero workerSignedAt", async function () {
      const { registry, workerSigner } = await setupAuthorizedProofRequest();
      const signature = await createProofResultSignature(registry, workerSigner, 1, passProofHash, 0, 0n);

      await expect(
        registry.submitProofResult(1, passProofHash, 0, resultMetadataHash, 0, signature),
      ).to.be.revertedWith("Worker signature timestamp required");
    });

    it("rejects empty signature", async function () {
      const { registry } = await setupAuthorizedProofRequest();

      await expect(
        registry.submitProofResult(1, passProofHash, 0, resultMetadataHash, workerSignedAt, "0x"),
      ).to.be.revertedWith("Signature required");
    });
  });

  describe("Proof Result Submission", function () {
    it("submits a PASS result with an authorized worker signature", async function () {
      const { registry, workerSigner, relayer } = await setupAuthorizedProofRequest();

      await expect(submitDefaultProofResult(registry, workerSigner, relayer, 1, passProofHash, 0))
        .to.emit(registry, "ProofResultSubmitted")
        .withArgs(
          1,
          1,
          projectId,
          passProofHash,
          0,
          true,
          resultMetadataHash,
          workerSigner.address,
          anyValue,
        );
    });

    it("submits a FAIL result with an authorized worker signature", async function () {
      const { registry, workerSigner, relayer } = await setupAuthorizedProofRequest();

      await submitDefaultProofResult(registry, workerSigner, relayer, 1, failProofHash, 1);
      const proofResult = await registry.getProofResult(1);

      expect(proofResult.outcome).to.equal(1);
    });

    it("stores thresholdMet = true for PASS", async function () {
      const { registry, workerSigner, relayer } = await setupAuthorizedProofRequest();

      await submitDefaultProofResult(registry, workerSigner, relayer, 1, passProofHash, 0);

      expect((await registry.getProofResult(1)).thresholdMet).to.equal(true);
    });

    it("stores thresholdMet = false for FAIL", async function () {
      const { registry, workerSigner, relayer } = await setupAuthorizedProofRequest();

      await submitDefaultProofResult(registry, workerSigner, relayer, 1, failProofHash, 1);

      expect((await registry.getProofResult(1)).thresholdMet).to.equal(false);
    });

    it("rejects duplicate proof result submission for the same request", async function () {
      const { registry, workerSigner, relayer } = await setupAuthorizedProofRequest();
      const failSignature = await createProofResultSignature(registry, workerSigner, 1, failProofHash, 1);

      await submitDefaultProofResult(registry, workerSigner, relayer, 1, passProofHash, 0);

      await expect(
        registry.submitProofResult(1, failProofHash, 1, resultMetadataHash, workerSignedAt, failSignature),
      ).to.be.revertedWith("Proof result already submitted");
    });

    it("marks proof request status as Completed after result submission", async function () {
      const { registry, workerSigner, relayer } = await setupAuthorizedProofRequest();

      await submitDefaultProofResult(registry, workerSigner, relayer);

      expect((await registry.getProofRequest(1)).status).to.equal(2);
    });

    it("getProofResult returns the stored result", async function () {
      const { registry, workerSigner, relayer } = await setupAuthorizedProofRequest();

      await submitDefaultProofResult(registry, workerSigner, relayer);
      const proofResult = await registry.getProofResult(1);

      expect(proofResult.id).to.equal(1);
      expect(proofResult.requestId).to.equal(1);
      expect(proofResult.projectId).to.equal(projectId);
      expect(proofResult.proofHash).to.equal(passProofHash);
      expect(proofResult.resultMetadataHash).to.equal(resultMetadataHash);
      expect(proofResult.exists).to.equal(true);
    });

    it("getProofResultByRequestId returns the stored result", async function () {
      const { registry, workerSigner, relayer } = await setupAuthorizedProofRequest();

      await submitDefaultProofResult(registry, workerSigner, relayer);
      const proofResult = await registry.getProofResultByRequestId(1);

      expect(proofResult.id).to.equal(1);
      expect(proofResult.requestId).to.equal(1);
    });

    it("getProofResultCount increases after submission", async function () {
      const { registry, workerSigner, relayer } = await setupAuthorizedProofRequest();

      expect(await registry.getProofResultCount()).to.equal(0);
      await submitDefaultProofResult(registry, workerSigner, relayer);
      expect(await registry.getProofResultCount()).to.equal(1);
    });

    it("stores submittedBy as the recovered worker signer", async function () {
      const { registry, workerSigner, relayer } = await setupAuthorizedProofRequest();

      await submitDefaultProofResult(registry, workerSigner, relayer);

      expect((await registry.getProofResult(1)).submittedBy).to.equal(workerSigner.address);
    });

    it("stores relayedBy as the transaction sender", async function () {
      const { registry, workerSigner, relayer } = await setupAuthorizedProofRequest();

      await submitDefaultProofResult(registry, workerSigner, relayer);

      expect((await registry.getProofResult(1)).relayedBy).to.equal(relayer.address);
    });

    it("emits ProofResultSubmitted", async function () {
      const { registry, workerSigner, relayer } = await setupAuthorizedProofRequest();

      await expect(submitDefaultProofResult(registry, workerSigner, relayer))
        .to.emit(registry, "ProofResultSubmitted")
        .withArgs(
          1,
          1,
          projectId,
          passProofHash,
          0,
          true,
          resultMetadataHash,
          workerSigner.address,
          anyValue,
        );
    });
  });

  describe("Proof History", function () {
    async function setupThreeProofResults() {
      const context = await setupRegisteredProject();
      const secondProofHash = ethers.keccak256(ethers.toUtf8Bytes("atlasx-proof-result-2"));
      const thirdProofHash = ethers.keccak256(ethers.toUtf8Bytes("atlasx-proof-result-3"));

      await authorizeWorkerSigner(context.registry, context.workerSigner.address);
      await createDefaultProofRequest(context.registry);
      await submitDefaultProofResult(context.registry, context.workerSigner, context.relayer, 1, passProofHash, 0);
      await createDefaultProofRequest(context.registry);
      await submitDefaultProofResult(context.registry, context.workerSigner, context.relayer, 2, secondProofHash, 1);
      await createDefaultProofRequest(context.registry);
      await submitDefaultProofResult(context.registry, context.workerSigner, context.relayer, 3, thirdProofHash, 0);

      return { ...context, secondProofHash, thirdProofHash };
    }

    it("fetches the latest proof result by project slug", async function () {
      const { registry, thirdProofHash } = await setupThreeProofResults();

      const latestProofResult = await registry.getLatestProofResultBySlug(projectSlug);

      expect(latestProofResult.id).to.equal(3);
      expect(latestProofResult.proofHash).to.equal(thirdProofHash);
    });

    it("stores project proof result IDs", async function () {
      const { registry } = await setupAuthorizedProofRequest();

      await submitDefaultProofResult(registry, (await ethers.getSigners())[1], (await ethers.getSigners())[2]);

      expect(await registry.getProjectProofResultIds(projectSlug)).to.deep.equal([1n]);
    });

    it("stores multiple proof results for the same project historically", async function () {
      const { registry } = await setupThreeProofResults();

      expect(await registry.getProjectProofResultIds(projectSlug)).to.deep.equal([1n, 2n, 3n]);
    });

    it("updates latest proof after a newer proof result is submitted", async function () {
      const { registry, workerSigner, relayer } = await setupRegisteredProject();
      const secondProofHash = ethers.keccak256(ethers.toUtf8Bytes("atlasx-proof-result-2"));

      await authorizeWorkerSigner(registry, workerSigner.address);
      await createDefaultProofRequest(registry);
      await submitDefaultProofResult(registry, workerSigner, relayer, 1, passProofHash, 0);
      expect((await registry.getLatestProofResultBySlug(projectSlug)).id).to.equal(1);

      await createDefaultProofRequest(registry);
      await submitDefaultProofResult(registry, workerSigner, relayer, 2, secondProofHash, 1);
      expect((await registry.getLatestProofResultBySlug(projectSlug)).id).to.equal(2);
    });

    it("increases project proof result count after each proof result", async function () {
      const { registry, workerSigner, relayer } = await setupRegisteredProject();
      const secondProofHash = ethers.keccak256(ethers.toUtf8Bytes("atlasx-proof-result-2"));

      await authorizeWorkerSigner(registry, workerSigner.address);
      expect(await registry.getProjectProofResultCount(projectSlug)).to.equal(0);

      await createDefaultProofRequest(registry);
      await submitDefaultProofResult(registry, workerSigner, relayer, 1, passProofHash, 0);
      expect(await registry.getProjectProofResultCount(projectSlug)).to.equal(1);

      await createDefaultProofRequest(registry);
      await submitDefaultProofResult(registry, workerSigner, relayer, 2, secondProofHash, 1);
      expect(await registry.getProjectProofResultCount(projectSlug)).to.equal(2);
    });

    it("returns the correct proof result ID by index", async function () {
      const { registry } = await setupThreeProofResults();

      expect(await registry.getProjectProofResultIdAt(projectSlug, 0)).to.equal(1);
      expect(await registry.getProjectProofResultIdAt(projectSlug, 1)).to.equal(2);
      expect(await registry.getProjectProofResultIdAt(projectSlug, 2)).to.equal(3);
    });

    it("rejects latest proof lookup for a non-existing project", async function () {
      const { registry } = await deployRegistryFixture();

      await expect(registry.getLatestProofResultBySlug("missing-project")).to.be.revertedWith(
        "Project does not exist",
      );
    });

    it("rejects latest proof lookup when project has no proof result", async function () {
      const { registry } = await setupRegisteredProject();

      await expect(registry.getLatestProofResultBySlug(projectSlug)).to.be.revertedWith(
        "Proof result does not exist",
      );
    });

    it("rejects project proof result IDs lookup for a non-existing project", async function () {
      const { registry } = await deployRegistryFixture();

      await expect(registry.getProjectProofResultIds("missing-project")).to.be.revertedWith(
        "Project does not exist",
      );
    });

    it("rejects proof result ID lookup at an invalid index", async function () {
      const { registry, workerSigner, relayer } = await setupAuthorizedProofRequest();

      await submitDefaultProofResult(registry, workerSigner, relayer);

      await expect(registry.getProjectProofResultIdAt(projectSlug, 1)).to.be.revertedWith(
        "Proof result index out of bounds",
      );
    });
  });

  describe("Access Control", function () {
    it("only contractOwner can manage worker signers", async function () {
      const { registry, workerSigner, other } = await deployRegistryFixture();

      await expect(
        registry.connect(other).setWorkerSigner(workerSigner.address, true),
      ).to.be.revertedWith("Only contract owner");
    });

    it("only project owner can create proof requests", async function () {
      const { registry, other } = await setupRegisteredProject();

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

    it("only authorized recovered worker signers can approve proof results", async function () {
      const { registry, other } = await setupProofRequest();
      const signature = await createProofResultSignature(registry, other);

      await expect(
        registry.submitProofResult(1, passProofHash, 0, resultMetadataHash, workerSignedAt, signature),
      ).to.be.revertedWith("Unauthorized worker signer");
    });
  });

  describe("Events", function () {
    it("emits ProjectRegistered", async function () {
      const { registry, deployer } = await deployRegistryFixture();

      await expect(registerDefaultProject(registry))
        .to.emit(registry, "ProjectRegistered")
        .withArgs(projectId, projectName, projectSlug, websiteHash, projectMetadataHash, deployer.address, anyValue);
    });

    it("emits ProofRequestCreated", async function () {
      const { registry, deployer } = await setupRegisteredProject();

      await expect(createDefaultProofRequest(registry))
        .to.emit(registry, "ProofRequestCreated")
        .withArgs(
          1,
          projectId,
          thresholdCommitment,
          selectedAssetsHash,
          selectedAssets,
          proofRequestMetadataHash,
          deployer.address,
          anyValue,
        );
    });

    it("emits WorkerSignerUpdated", async function () {
      const { registry, workerSigner } = await deployRegistryFixture();

      await expect(authorizeWorkerSigner(registry, workerSigner.address))
        .to.emit(registry, "WorkerSignerUpdated")
        .withArgs(workerSigner.address, true, anyValue);
    });

    it("emits ProofResultSubmitted", async function () {
      const { registry, workerSigner, relayer } = await setupAuthorizedProofRequest();

      await expect(submitDefaultProofResult(registry, workerSigner, relayer))
        .to.emit(registry, "ProofResultSubmitted")
        .withArgs(1, 1, projectId, passProofHash, 0, true, resultMetadataHash, workerSigner.address, anyValue);
    });
  });

  describe("Privacy Boundary", function () {
    const forbiddenTerms = [
      "fullWalletAddress",
      "walletAddress",
      "exactBalance",
      "exactBalances",
      "privateReserveComposition",
      "reserveComposition",
      "treasuryStrategy",
      "rawFdcPayload",
      "rawFDC",
      "rawFtsoCalculationTrace",
      "rawFTSO",
      "fccComputationTrace",
      "FCCComputationTrace",
    ];

    it("ABI does not expose private reserve fields", async function () {
      const { registry } = await deployRegistryFixture();
      const abiText = registry.interface.fragments.map((fragment) => fragment.format("full")).join("\n");

      for (const forbiddenTerm of forbiddenTerms) {
        expect(abiText).to.not.include(forbiddenTerm);
      }
    });

    it("Project storage does not include private reserve fields", async function () {
      const { registry } = await setupRegisteredProject();
      const project = await registry.getProjectBySlug(projectSlug);
      const projectText = Object.keys(project.toObject()).join(",");

      for (const forbiddenTerm of forbiddenTerms) {
        expect(projectText).to.not.include(forbiddenTerm);
      }
    });

    it("ProofRequest storage uses commitments and hashes instead of raw private values", async function () {
      const { registry } = await setupProofRequest();
      const proofRequest = await registry.getProofRequest(1);
      const proofRequestText = Object.keys(proofRequest.toObject()).join(",");

      expect(proofRequest.thresholdCommitment).to.equal(thresholdCommitment);
      expect(proofRequest.selectedAssetsHash).to.equal(selectedAssetsHash);

      for (const forbiddenTerm of forbiddenTerms) {
        expect(proofRequestText).to.not.include(forbiddenTerm);
      }
    });

    it("ProofResult storage keeps only public proof result data", async function () {
      const { registry, workerSigner, relayer } = await setupAuthorizedProofRequest();

      await submitDefaultProofResult(registry, workerSigner, relayer);
      const proofResult = await registry.getProofResult(1);
      const proofResultText = Object.keys(proofResult.toObject()).join(",");

      expect(proofResult.proofHash).to.equal(passProofHash);
      expect(proofResult.resultMetadataHash).to.equal(resultMetadataHash);

      for (const forbiddenTerm of forbiddenTerms) {
        expect(proofResultText).to.not.include(forbiddenTerm);
      }
    });
  });
});
