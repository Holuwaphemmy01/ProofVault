export type FdcSourceConfig = {
  sourceId: "testXRP" | "testBTC" | "testDOGE";
  verifierPath: "xrp" | "btc" | "doge";
};

export type AddressValidityInput = {
  chain: string;
  address: string;
};

export type AddressValidityResult = {
  attestationType: "AddressValidity";
  chain: string;
  valid: boolean;
  roundId: number;
  requestTxHash: string;
  proofAvailable: boolean;
  verificationSource: "FDC";
};

export type PaymentAttestationInput = {
  chain: "XRP";
  transactionId: string;
  expectedDestination?: string;
  expectedReference?: string;
};

export type PaymentAttestationResult = {
  attestationType: "Payment";
  chain: "XRP";
  verified: true;
  transactionIdHash: string;
  requestTxHash: string;
  roundId: number;
  verificationSource: "FDC";
};

export type PreparedFdcRequest = {
  abiEncodedRequest: string;
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
