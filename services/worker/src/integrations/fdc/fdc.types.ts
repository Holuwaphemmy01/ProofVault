export type FdcSourceConfig = {
  sourceId: "testXRP" | "testBTC" | "testDOGE";
  verifierPath: "xrp" | "btc_testnet4" | "doge";
  canonicalChain: "XRP" | "BTC" | "DOGE";
};

export type AddressValidityInput = {
  chain: string;
  address: string;
};

export type AddressValidityResult = {
  attestationType: "AddressValidity";
  chain: "XRP" | "BTC" | "DOGE";
  valid: boolean;
  source: "FDC";
  roundId: number;
  votingRoundId: number;
  requestTxHash: string;
  requestBlockNumber: number;
  proofAvailable: boolean;
  proofVerified: true;
  verificationSource: "FDC";
  fdcHubAddress: string;
  fdcHubAddressSource: "contract-registry" | "injected";
  fdcVerificationAddress: string;
  fdcVerificationAddressSource: "contract-registry" | "injected";
  verifiedAt: string;
};

export type PaymentAttestationInput = {
  chain: "XRP";
  transactionId: string;
  expectedDestination?: string;
  expectedAmount?: string;
  expectedReference?: string;
};

export type PaymentAttestationResult = {
  attestationType: "Payment";
  chain: "XRP";
  verified: true;
  transactionIdHash: string;
  requestTxHash: string;
  requestBlockNumber: number;
  roundId: number;
  votingRoundId: number;
  proofAvailable: true;
  proofVerified: true;
  source: "FDC";
  verificationSource: "FDC";
  fdcHubAddress: string;
  fdcHubAddressSource: "contract-registry" | "injected";
  fdcVerificationAddress: string;
  fdcVerificationAddressSource: "contract-registry" | "injected";
  verifiedAt: string;
};

export type PreparedFdcRequest = {
  abiEncodedRequest: string;
  status?: string;
};

export type FdcDaProofResponse = {
  response_hex?: string;
  responseHex?: string;
  proof?: string[];
  proofs?: string[];
  attestation_type?: string;
  attestationType?: string;
};

export type AddressValidityProof = {
  merkleProof: string[];
  data: {
    attestationType: string;
    sourceId: string;
    votingRound: bigint;
    lowestUsedTimestamp: bigint;
    requestBody: {
      addressStr: string;
    };
    responseBody: {
      isValid: boolean;
      standardAddress: string;
      standardAddressHash: string;
    };
  };
};

export type PaymentProof = {
  merkleProof: string[];
  data: {
    attestationType: string;
    sourceId: string;
    votingRound: bigint;
    lowestUsedTimestamp: bigint;
    requestBody: {
      transactionId: string;
      inUtxo: bigint;
      utxo: bigint;
    };
    responseBody: {
      blockNumber: bigint;
      blockTimestamp: bigint;
      sourceAddressHash: string;
      sourceAddressesRoot: string;
      receivingAddressHash: string;
      intendedReceivingAddressHash: string;
      spentAmount: bigint;
      intendedSpentAmount: bigint;
      receivedAmount: bigint;
      intendedReceivedAmount: bigint;
      standardPaymentReference: string;
      oneToOne: boolean;
      status: number;
    };
  };
};
