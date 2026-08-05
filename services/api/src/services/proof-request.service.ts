import crypto from "node:crypto";
import { ethers } from "ethers";
import type { AssetBalance, ProofRequest } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { CreateProofRequestInput } from "../schemas/proof-request.schema.js";
import { createProofRequestOnChain } from "./contract.service.js";

function sha256(value: string) {
  return `0x${crypto.createHash("sha256").update(value).digest("hex")}`;
}

type ProofRequestWithAssetBalances = ProofRequest & {
  assetBalances: AssetBalance[];
};

function toAssetReferenceSummary(assetBalance: AssetBalance) {
  return {
    id: assetBalance.id,
    assetSymbol: assetBalance.assetSymbol,
    chain: assetBalance.chain,
    sourceLabel: assetBalance.sourceLabel,
    maskedWalletAddress: assetBalance.maskedWalletAddress,
    walletAddressHash: assetBalance.walletAddressHash,
    validationStatus: assetBalance.validationStatus,
    encryptionVersion: assetBalance.encryptionVersion,
  };
}

function toProofRequestResponse(proofRequest: ProofRequestWithAssetBalances) {
  return {
    id: proofRequest.id,
    projectId: proofRequest.projectId,
    projectSlug: proofRequest.projectSlug,
    proofName: proofRequest.proofName,
    requiredThreshold: proofRequest.requiredThreshold,
    thresholdCurrency: proofRequest.thresholdCurrency,
    thresholdCommitment: proofRequest.thresholdCommitment,
    selectedAssets: proofRequest.selectedAssets,
    selectedAssetsHash: proofRequest.selectedAssetsHash,
    privacyMode: proofRequest.privacyMode,
    metadataHash: proofRequest.metadataHash,
    status: proofRequest.status,
    onChainRequestId: proofRequest.onChainRequestId,
    onChainTxHash: proofRequest.onChainTxHash,
    onChainStatus: proofRequest.onChainStatus,
    createdAt: proofRequest.createdAt,
    updatedAt: proofRequest.updatedAt,
    walletReferences: proofRequest.assetBalances.map(toAssetReferenceSummary),
  };
}

export async function createProofRequest(input: CreateProofRequestInput) {
  const project = await prisma.project.findUnique({
    where: { slug: input.projectSlug },
  });

  if (!project) {
    return undefined;
  }

  const selectedAssets = input.selectedAssets.map((asset) => asset.trim()).join(",");
  const selectedAssetsHash = ethers.keccak256(ethers.toUtf8Bytes(selectedAssets));
  const thresholdSalt = crypto.randomBytes(16).toString("hex");
  const thresholdCommitment = sha256([
    input.projectSlug,
    input.requiredThreshold,
    input.thresholdCurrency,
    selectedAssets,
    thresholdSalt,
  ].join(":"));
  const metadataHash = sha256(JSON.stringify({
    projectSlug: input.projectSlug,
    proofName: input.proofName,
    selectedAssets: input.selectedAssets,
    privacyMode: input.privacyMode,
    thresholdCurrency: input.thresholdCurrency,
    walletReferences: input.walletReferences.map((reference) => ({
      assetSymbol: reference.assetSymbol,
      chain: reference.chain,
      sourceLabel: reference.sourceLabel,
      walletAddressHash: reference.walletAddressHash,
      maskedWalletAddress: reference.maskedWalletAddress,
      encryptionVersion: reference.encryptionVersion,
    })),
  }));

  const proofRequest = await prisma.proofRequest.create({
    data: {
      projectId: project.id,
      projectSlug: input.projectSlug,
      proofName: input.proofName,
      requiredThreshold: input.requiredThreshold,
      thresholdCurrency: input.thresholdCurrency,
      thresholdCommitment,
      selectedAssets: input.selectedAssets,
      selectedAssetsHash,
      privacyMode: input.privacyMode,
      metadataHash,
      status: "pending",
      assetBalances: {
        create: input.walletReferences.map((reference) => ({
          assetSymbol: reference.assetSymbol,
          chain: reference.chain,
          sourceLabel: reference.sourceLabel,
          encryptedWalletReference: reference.encryptedWalletReference,
          encryptedPayloadHash: sha256(reference.encryptedWalletReference),
          encryptionVersion: reference.encryptionVersion,
          walletAddressHash: reference.walletAddressHash,
          maskedWalletAddress: reference.maskedWalletAddress,
          validationStatus: "pending",
        })),
      },
    },
    include: {
      assetBalances: true,
    },
  });

  try {
    const onChain = await createProofRequestOnChain({
      slug: input.projectSlug,
      thresholdCommitment,
      selectedAssets,
      selectedAssetsHash,
      metadataHash,
    });

    const updatedProofRequest = await prisma.proofRequest.update({
      where: { id: proofRequest.id },
      data: {
        onChainRequestId: onChain.requestId,
        onChainTxHash: onChain.transactionHash,
        onChainStatus: "created",
      },
      include: {
        assetBalances: true,
      },
    });

    return {
      proofRequest: toProofRequestResponse(updatedProofRequest),
      onChain: {
        status: "created",
        ...onChain,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "On-chain proof request creation failed";
    const updatedProofRequest = await prisma.proofRequest.update({
      where: { id: proofRequest.id },
      data: {
        onChainStatus: "failed",
      },
      include: {
        assetBalances: true,
      },
    });

    return {
      proofRequest: toProofRequestResponse(updatedProofRequest),
      onChain: {
        status: "failed",
        message,
      },
    };
  }
}

export async function getProofRequestById(id: string) {
  const proofRequest = await prisma.proofRequest.findUnique({
    where: { id },
    include: {
      assetBalances: true,
    },
  });

  return proofRequest ? toProofRequestResponse(proofRequest) : undefined;
}

export async function getProofRequestsByProjectSlug(projectSlug: string) {
  const proofRequests = await prisma.proofRequest.findMany({
    where: { projectSlug },
    orderBy: { createdAt: "desc" },
    include: {
      assetBalances: true,
    },
  });

  return proofRequests.map(toProofRequestResponse);
}
