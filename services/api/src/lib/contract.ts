import { Contract, JsonRpcProvider, Wallet, ethers } from "ethers";
import { env } from "./env.js";

export const proofVaultRegistryAbi = [
  "event ProjectRegistered(bytes32 indexed projectId,string name,string slug,bytes32 websiteHash,bytes32 metadataHash,address indexed owner,uint256 createdAt)",
  "event ProofRequestCreated(uint256 indexed requestId,bytes32 indexed projectId,bytes32 thresholdCommitment,bytes32 selectedAssetsHash,string selectedAssets,bytes32 metadataHash,address indexed createdBy,uint256 createdAt)",
  "function registerProject(string name,string slug,bytes32 websiteHash,bytes32 metadataHash) returns (bytes32 projectId)",
  "function createProofRequest(string slug,bytes32 thresholdCommitment,string selectedAssets,bytes32 selectedAssetsHash,bytes32 metadataHash) returns (uint256 requestId)",
  "function getProjectBySlug(string slug) view returns (tuple(string name,string slug,bytes32 websiteHash,bytes32 metadataHash,address owner,bool exists,uint256 createdAt,uint256 updatedAt))",
  "function projectExists(string slug) view returns (bool)",
  "function getLatestProofResultBySlug(string slug) view returns (tuple(uint256 id,uint256 requestId,bytes32 projectId,bytes32 proofHash,uint8 outcome,bool thresholdMet,bytes32 resultMetadataHash,address submittedBy,address relayedBy,uint256 workerSignedAt,uint256 submittedAt,bool exists))",
] as const;

function requireContractAddress() {
  if (!env.PROOFVAULT_REGISTRY_ADDRESS) {
    throw new Error("PROOFVAULT_REGISTRY_ADDRESS is not configured");
  }
}

function getProvider() {
  if (!env.RPC_URL) {
    throw new Error("RPC_URL is not configured");
  }

  return new JsonRpcProvider(env.RPC_URL);
}

export function getRegistryReadContract() {
  requireContractAddress();
  return new Contract(env.PROOFVAULT_REGISTRY_ADDRESS, proofVaultRegistryAbi, getProvider());
}

export function getRegistryWriteContract() {
  requireContractAddress();

  if (!env.RELAYER_PRIVATE_KEY) {
    throw new Error("RELAYER_PRIVATE_KEY is not configured");
  }

  const signer = new Wallet(env.RELAYER_PRIVATE_KEY, getProvider());
  return new Contract(env.PROOFVAULT_REGISTRY_ADDRESS, proofVaultRegistryAbi, signer);
}

export function computeProjectId(slug: string) {
  return ethers.keccak256(ethers.toUtf8Bytes(slug));
}
