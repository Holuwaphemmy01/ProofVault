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
