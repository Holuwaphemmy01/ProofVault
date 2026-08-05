ALTER TABLE "ProofRequest" ADD COLUMN "encryptedPayload" TEXT;
ALTER TABLE "ProofRequest" ADD COLUMN "encryptedPayloadHash" TEXT;
ALTER TABLE "ProofRequest" ADD COLUMN "encryptionVersion" TEXT;
ALTER TABLE "ProofRequest" ADD COLUMN "encryptionAlgorithm" TEXT;
ALTER TABLE "ProofRequest" ADD COLUMN "encryptionKeyId" TEXT;
