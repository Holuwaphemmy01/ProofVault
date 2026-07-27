import { ethers } from "hardhat";

async function main() {
  const ProofVaultRegistry = await ethers.getContractFactory("ProofVaultRegistry");
  const proofVaultRegistry = await ProofVaultRegistry.deploy();

  await proofVaultRegistry.waitForDeployment();

  console.log(`ProofVaultRegistry deployed to ${await proofVaultRegistry.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
