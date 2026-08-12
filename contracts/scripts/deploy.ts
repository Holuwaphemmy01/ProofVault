import { ethers } from "hardhat";
import fs from "node:fs/promises";
import path from "node:path";

async function main() {
  const network = await ethers.provider.getNetwork();
  const [deployer] = await ethers.getSigners();

  if (!deployer) {
    throw new Error("No deployer signer configured. Set DEPLOYER_PRIVATE_KEY for Coston2 deployments.");
  }

  const ProofVaultRegistry = await ethers.getContractFactory("ProofVaultRegistry");
  const proofVaultRegistry = await ProofVaultRegistry.deploy();

  await proofVaultRegistry.waitForDeployment();
  const deploymentTransaction = proofVaultRegistry.deploymentTransaction();
  const deploymentReceipt = deploymentTransaction ? await deploymentTransaction.wait() : null;
  const registryAddress = await proofVaultRegistry.getAddress();
  const deployedAt = new Date().toISOString();

  const deployment = {
    network: network.chainId === 114n ? "coston2" : "local",
    chainId: Number(network.chainId),
    registryAddress,
    deploymentTxHash: deploymentTransaction?.hash ?? "",
    blockNumber: deploymentReceipt?.blockNumber?.toString() ?? "",
    deployerAddress: deployer.address,
    deployedAt,
  };

  console.log(JSON.stringify(deployment, null, 2));

  if (network.chainId === 114n) {
    const deploymentsDirectory = path.resolve(process.cwd(), "..", "deployments");

    await fs.mkdir(deploymentsDirectory, { recursive: true });
    await fs.writeFile(
      path.join(deploymentsDirectory, "coston2.json"),
      `${JSON.stringify({
        network: deployment.network,
        chainId: deployment.chainId,
        registryAddress: deployment.registryAddress,
        deploymentTxHash: deployment.deploymentTxHash,
        blockNumber: deployment.blockNumber,
        deployedAt: deployment.deployedAt,
      }, null, 2)}\n`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
