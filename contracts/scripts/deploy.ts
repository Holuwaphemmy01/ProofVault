import { ethers } from "hardhat";

async function main() {
  const ProofRegistry = await ethers.getContractFactory("ProofRegistry");
  const proofRegistry = await ProofRegistry.deploy();

  await proofRegistry.waitForDeployment();

  console.log(`ProofRegistry deployed to ${await proofRegistry.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
