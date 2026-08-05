ALTER TABLE "ProofRequest" ADD COLUMN "onChainTxHash" TEXT;
ALTER TABLE "ProofRequest" ADD COLUMN "onChainStatus" TEXT;

ALTER TABLE "AssetBalance" ADD COLUMN "encryptedWalletReference" TEXT;
ALTER TABLE "AssetBalance" ADD COLUMN "encryptedPayloadHash" TEXT;
ALTER TABLE "AssetBalance" ADD COLUMN "encryptionVersion" TEXT;
