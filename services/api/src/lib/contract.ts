import { Contract, JsonRpcProvider, Wallet, ethers } from "ethers";
import { proofVaultRegistryAbi } from "../abi/ProofVaultRegistry.abi.js";
import { env } from "./env.js";

export { proofVaultRegistryAbi };

export class ContractConfigurationError extends Error {
  constructor(message = "Contract is not configured") {
    super(message);
    this.name = "ContractConfigurationError";
  }
}

function requireRpcUrl() {
  if (!env.RPC_URL) {
    throw new ContractConfigurationError("RPC_URL is not configured");
  }
}

function requireRegistryAddress() {
  if (!env.PROOFVAULT_REGISTRY_ADDRESS) {
    throw new ContractConfigurationError("PROOFVAULT_REGISTRY_ADDRESS is not configured");
  }
}

function requireRelayerPrivateKey() {
  if (!env.RELAYER_PRIVATE_KEY) {
    throw new ContractConfigurationError("RELAYER_PRIVATE_KEY is not configured");
  }
}

export function getProvider() {
  requireRpcUrl();
  return new JsonRpcProvider(env.RPC_URL);
}

export function getRelayerWallet() {
  requireRelayerPrivateKey();
  return new Wallet(env.RELAYER_PRIVATE_KEY, getProvider());
}

export function getRegistryReadContract() {
  requireRegistryAddress();
  return new Contract(env.PROOFVAULT_REGISTRY_ADDRESS, proofVaultRegistryAbi, getProvider());
}

export function getRegistryWriteContract() {
  requireRegistryAddress();
  return new Contract(env.PROOFVAULT_REGISTRY_ADDRESS, proofVaultRegistryAbi, getRelayerWallet());
}

export function getRegistryAddress() {
  requireRegistryAddress();
  return env.PROOFVAULT_REGISTRY_ADDRESS;
}

export function computeProjectId(slug: string) {
  return ethers.keccak256(ethers.toUtf8Bytes(slug));
}

export const provider = getProvider;
export const relayerWallet = getRelayerWallet;
export const registryReadContract = getRegistryReadContract;
export const registryWriteContract = getRegistryWriteContract;
