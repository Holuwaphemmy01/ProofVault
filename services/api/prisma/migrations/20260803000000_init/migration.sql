CREATE TYPE "ProjectType" AS ENUM ('exchange', 'dao', 'bridge', 'lending_protocol', 'stablecoin_issuer', 'asset_backed_token', 'other');
CREATE TYPE "ProofRequestStatus" AS ENUM ('draft', 'pending', 'verifying', 'completed', 'cancelled', 'failed');
CREATE TYPE "PrivacyMode" AS ENUM ('confidential_threshold_proof', 'partial_disclosure', 'public_reserve_snapshot');
CREATE TYPE "ProofOutcome" AS ENUM ('PASS', 'FAIL', 'PENDING');

CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "websiteHash" TEXT NOT NULL,
    "metadataHash" TEXT NOT NULL,
    "projectType" "ProjectType" NOT NULL,
    "description" TEXT,
    "ownerWallet" TEXT NOT NULL,
    "maskedOwnerWallet" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProofRequest" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "projectSlug" TEXT NOT NULL,
    "proofName" TEXT NOT NULL,
    "requiredThreshold" DECIMAL(20,2) NOT NULL,
    "thresholdCurrency" TEXT NOT NULL DEFAULT 'USD',
    "thresholdCommitment" TEXT NOT NULL,
    "selectedAssets" TEXT[],
    "selectedAssetsHash" TEXT NOT NULL,
    "privacyMode" "PrivacyMode" NOT NULL,
    "metadataHash" TEXT NOT NULL,
    "status" "ProofRequestStatus" NOT NULL DEFAULT 'draft',
    "onChainRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProofRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AssetBalance" (
    "id" TEXT NOT NULL,
    "proofRequestId" TEXT NOT NULL,
    "assetSymbol" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "sourceLabel" TEXT,
    "walletAddressHash" TEXT NOT NULL,
    "maskedWalletAddress" TEXT,
    "visibilityPreference" TEXT NOT NULL DEFAULT 'hidden',
    "verificationMethod" TEXT,
    "validationStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetBalance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProofResult" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "projectSlug" TEXT NOT NULL,
    "proofRequestId" TEXT NOT NULL,
    "outcome" "ProofOutcome" NOT NULL,
    "thresholdMet" BOOLEAN NOT NULL,
    "proofHash" TEXT NOT NULL,
    "resultMetadataHash" TEXT NOT NULL,
    "transactionHash" TEXT,
    "onChainResultId" TEXT,
    "workerSignedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedBy" TEXT,
    "relayedBy" TEXT,
    "verifiedWith" TEXT[],
    "publicMessage" TEXT,

    CONSTRAINT "ProofResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkerCallback" (
    "id" TEXT NOT NULL,
    "proofRequestId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,

    CONSTRAINT "WorkerCallback_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
CREATE UNIQUE INDEX "ProofResult_proofRequestId_key" ON "ProofResult"("proofRequestId");
CREATE INDEX "Project_slug_idx" ON "Project"("slug");
CREATE INDEX "Project_ownerWallet_idx" ON "Project"("ownerWallet");
CREATE INDEX "ProofRequest_projectId_idx" ON "ProofRequest"("projectId");
CREATE INDEX "ProofRequest_projectSlug_idx" ON "ProofRequest"("projectSlug");
CREATE INDEX "ProofRequest_status_idx" ON "ProofRequest"("status");
CREATE INDEX "AssetBalance_proofRequestId_idx" ON "AssetBalance"("proofRequestId");
CREATE INDEX "AssetBalance_assetSymbol_idx" ON "AssetBalance"("assetSymbol");
CREATE INDEX "AssetBalance_chain_idx" ON "AssetBalance"("chain");
CREATE INDEX "ProofResult_projectId_idx" ON "ProofResult"("projectId");
CREATE INDEX "ProofResult_projectSlug_idx" ON "ProofResult"("projectSlug");
CREATE INDEX "ProofResult_outcome_idx" ON "ProofResult"("outcome");
CREATE INDEX "ProofResult_submittedAt_idx" ON "ProofResult"("submittedAt");
CREATE INDEX "WorkerCallback_proofRequestId_idx" ON "WorkerCallback"("proofRequestId");
CREATE INDEX "WorkerCallback_status_idx" ON "WorkerCallback"("status");

ALTER TABLE "ProofRequest" ADD CONSTRAINT "ProofRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssetBalance" ADD CONSTRAINT "AssetBalance_proofRequestId_fkey" FOREIGN KEY ("proofRequestId") REFERENCES "ProofRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProofResult" ADD CONSTRAINT "ProofResult_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProofResult" ADD CONSTRAINT "ProofResult_proofRequestId_fkey" FOREIGN KEY ("proofRequestId") REFERENCES "ProofRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
