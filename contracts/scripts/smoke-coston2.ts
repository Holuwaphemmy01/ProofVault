import { ethers } from "hardhat";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

async function waitForTransaction(transaction: { hash: string; wait: () => Promise<any> }) {
  const receipt = await transaction.wait();

  return {
    transactionHash: transaction.hash,
    blockNumber: receipt?.blockNumber?.toString() ?? "",
  };
}

async function main() {
  const registryAddress = requireEnv("PROOFVAULT_REGISTRY_ADDRESS");
  const workerPrivateKey = requireEnv("WORKER_PRIVATE_KEY");
  const network = await ethers.provider.getNetwork();
  const [deployer] = await ethers.getSigners();

  if (network.chainId !== 114n) {
    throw new Error(`Coston2 smoke test must run on chain ID 114. Current chain ID: ${network.chainId}`);
  }

  if (!deployer) {
    throw new Error("DEPLOYER_PRIVATE_KEY is required for Coston2 smoke test");
  }

  const worker = new ethers.Wallet(workerPrivateKey);
  const registry = await ethers.getContractAt("ProofVaultRegistry", registryAddress, deployer);
  const slug = "atlasx-exchange";
  const websiteHash = ethers.keccak256(ethers.toUtf8Bytes("https://atlasx.exchange"));
  const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("atlasx-exchange:coston2:metadata"));
  const thresholdCommitment = ethers.keccak256(
    ethers.toUtf8Bytes("atlasx-exchange:1000000:USD:private-salt"),
  );
  const selectedAssets = "FXRP,FLR";
  const selectedAssetsHash = ethers.keccak256(ethers.toUtf8Bytes(selectedAssets));
  const requestMetadataHash = ethers.keccak256(ethers.toUtf8Bytes("atlasx-exchange:proof-request:metadata"));
  const proofHash = ethers.keccak256(ethers.toUtf8Bytes("atlasx-exchange:proof-result:pass"));
  const resultMetadataHash = ethers.keccak256(ethers.toUtf8Bytes("atlasx-exchange:proof-result:metadata"));
  const workerSignedAt = Math.floor(Date.now() / 1000);

  const projectRegistered = await waitForTransaction(await registry.registerProject(
    "AtlasX Exchange",
    slug,
    websiteHash,
    metadataHash,
  ));
  const workerSignerUpdated = await waitForTransaction(await registry.setWorkerSigner(worker.address, true));
  const proofRequestCreated = await waitForTransaction(await registry.createProofRequest(
    slug,
    thresholdCommitment,
    selectedAssets,
    selectedAssetsHash,
    requestMetadataHash,
  ));
  const requestCount = await registry.getProofRequestCount();
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ["address", "uint256", "uint256", "bytes32", "uint8", "uint256", "bytes32"],
    [registryAddress, 114, requestCount, proofHash, 0, workerSignedAt, resultMetadataHash],
  );
  const messageHash = ethers.keccak256(encoded);
  const signature = await worker.signMessage(ethers.getBytes(messageHash));
  const proofResultSubmitted = await waitForTransaction(await registry.submitProofResult(
    requestCount,
    proofHash,
    0,
    resultMetadataHash,
    workerSignedAt,
    signature,
  ));
  const latestProof = await registry.getLatestProofResultBySlug(slug);
  const proofHistory = await registry.getProjectProofResultIds(slug);

  console.log(JSON.stringify({
    network: "coston2",
    chainId: Number(network.chainId),
    registryAddress,
    deployerAddress: deployer.address,
    workerSignerAddress: worker.address,
    transactions: {
      ProjectRegistered: projectRegistered,
      WorkerSignerUpdated: workerSignerUpdated,
      ProofRequestCreated: proofRequestCreated,
      ProofResultSubmitted: proofResultSubmitted,
    },
    latestProof: {
      id: latestProof.id.toString(),
      requestId: latestProof.requestId.toString(),
      outcome: Number(latestProof.outcome) === 0 ? "PASS" : "FAIL",
      thresholdMet: latestProof.thresholdMet,
      proofHash: latestProof.proofHash,
    },
    proofHistory: proofHistory.map((id: bigint) => id.toString()),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
