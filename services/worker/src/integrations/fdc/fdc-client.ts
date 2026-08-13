import { AbiCoder, Contract, JsonRpcProvider, Wallet, toUtf8Bytes, zeroPadBytes } from "ethers";
import { env } from "../../lib/env.js";
import type {
  AddressValidityProof,
  FdcDaProofResponse,
  FdcSourceConfig,
  PaymentProof,
  PreparedFdcRequest,
} from "./fdc.types.js";

const registryAbi = ["function getContractAddressByName(string _name) external view returns (address)"] as const;
const hubAbi = ["function requestAttestation(bytes _data) external payable"] as const;
const feeAbi = ["function getRequestFee(bytes _data) external view returns (uint256)"] as const;
const systemsAbi = [
  "function getCurrentVotingEpochId() external view returns (uint32)",
  "function firstVotingRoundStartTs() external view returns (uint256)",
  "function votingEpochDurationSeconds() external view returns (uint256)",
] as const;
const relayAbi = ["function isFinalized(uint256 _protocolId, uint256 _votingRoundId) external view returns (bool)"] as const;
const verificationAbi = [
  "function fdcProtocolId() external view returns (uint8)",
  "function verifyAddressValidity((bytes32[] merkleProof,(bytes32 attestationType,bytes32 sourceId,uint64 votingRound,uint64 lowestUsedTimestamp,(string addressStr) requestBody,(bool isValid,string standardAddress,bytes32 standardAddressHash) responseBody) data) _proof) external view returns (bool)",
  "function verifyPayment((bytes32[] merkleProof,(bytes32 attestationType,bytes32 sourceId,uint64 votingRound,uint64 lowestUsedTimestamp,(bytes32 transactionId,uint256 inUtxo,uint256 utxo) requestBody,(uint64 blockNumber,uint64 blockTimestamp,bytes32 sourceAddressHash,bytes32 sourceAddressesRoot,bytes32 receivingAddressHash,bytes32 intendedReceivingAddressHash,int256 spentAmount,int256 intendedSpentAmount,int256 receivedAmount,int256 intendedReceivedAmount,bytes32 standardPaymentReference,bool oneToOne,uint8 status) responseBody) data) _proof) external view returns (bool)",
] as const;

const addressValidityResponseType =
  "tuple(bytes32 attestationType,bytes32 sourceId,uint64 votingRound,uint64 lowestUsedTimestamp,tuple(string addressStr) requestBody,tuple(bool isValid,string standardAddress,bytes32 standardAddressHash) responseBody)";
const paymentResponseType =
  "tuple(bytes32 attestationType,bytes32 sourceId,uint64 votingRound,uint64 lowestUsedTimestamp,tuple(bytes32 transactionId,uint256 inUtxo,uint256 utxo) requestBody,tuple(uint64 blockNumber,uint64 blockTimestamp,bytes32 sourceAddressHash,bytes32 sourceAddressesRoot,bytes32 receivingAddressHash,bytes32 intendedReceivingAddressHash,int256 spentAmount,int256 intendedSpentAmount,int256 receivedAmount,int256 intendedReceivedAmount,bytes32 standardPaymentReference,bool oneToOne,uint8 status) responseBody)";

type FdcContracts = NonNullable<FdcClientOptions["contracts"]>;

export type FdcClientOptions = {
  rpcUrl?: string;
  verifierUrl?: string;
  daLayerUrl?: string;
  apiKey?: string;
  contractRegistryAddress?: string;
  privateKey?: string;
  fetchFn?: typeof fetch;
  contracts?: Partial<{
    fdcHub: { requestAttestation(data: string, options: { value: bigint }): Promise<{ hash: string; wait(): Promise<{ blockNumber: number; hash?: string }> }> };
    feeConfigurations: { getRequestFee(data: string): Promise<bigint> };
    flareSystemsManager: {
      getCurrentVotingEpochId?(): Promise<bigint | number>;
      firstVotingRoundStartTs(): Promise<bigint>;
      votingEpochDurationSeconds(): Promise<bigint>;
    };
    relay: { isFinalized(protocolId: number, roundId: number): Promise<boolean> };
    verification: {
      fdcProtocolId(): Promise<bigint | number>;
      verifyAddressValidity(proof: AddressValidityProof): Promise<boolean>;
      verifyPayment(proof: PaymentProof): Promise<boolean>;
    };
  }>;
  provider?: Pick<JsonRpcProvider, "getBlock">;
  pollIntervalMs?: number;
  maxWaitMs?: number;
};

export class FdcClient {
  private readonly provider: JsonRpcProvider;
  private readonly fetchFn: typeof fetch;
  private readonly verifierUrl: string;
  private readonly daLayerUrl: string;
  private readonly apiKey: string;
  private readonly contractRegistryAddress: string;
  private readonly privateKey: string;
  private readonly pollIntervalMs: number;
  private readonly maxWaitMs: number;
  private readonly contracts?: FdcClientOptions["contracts"];

  constructor(options: FdcClientOptions = {}) {
    const rpcUrl = options.rpcUrl ?? env.COSTON2_RPC_URL;

    if (!options.contracts && !rpcUrl) {
      throw new Error("COSTON2_RPC_URL is required for FDC requests");
    }

    this.provider = (options.provider ?? new JsonRpcProvider(rpcUrl, 114)) as JsonRpcProvider;
    this.fetchFn = options.fetchFn ?? fetch;
    this.verifierUrl = ensureTrailingSlash(options.verifierUrl ?? env.FDC_VERIFIER_URL);
    this.daLayerUrl = ensureTrailingSlash(options.daLayerUrl ?? env.FDC_DA_LAYER_URL);
    this.apiKey = (options.apiKey ?? env.FDC_API_KEY) || "00000000-0000-0000-0000-000000000000";
    this.contractRegistryAddress = options.contractRegistryAddress ?? env.FDC_CONTRACT_REGISTRY_ADDRESS;
    this.privateKey = options.privateKey ?? env.WORKER_PRIVATE_KEY;
    this.pollIntervalMs = options.pollIntervalMs ?? env.FDC_POLL_INTERVAL_MS;
    this.maxWaitMs = options.maxWaitMs ?? env.FDC_MAX_WAIT_MS;
    this.contracts = options.contracts;
  }

  async prepareAddressValidityRequest(config: FdcSourceConfig, address: string): Promise<PreparedFdcRequest> {
    return this.prepareAttestationRequest({
      verifierPath: config.verifierPath,
      attestationType: "AddressValidity",
      sourceId: config.sourceId,
      requestBody: {
        addressStr: address,
      },
    });
  }

  async preparePaymentRequest(input: {
    verifierPath: string;
    sourceId: "testXRP";
    transactionId: string;
    inUtxo?: string;
    utxo?: string;
  }): Promise<PreparedFdcRequest> {
    return this.prepareAttestationRequest({
      verifierPath: input.verifierPath,
      attestationType: "Payment",
      sourceId: input.sourceId,
      requestBody: {
        transactionId: input.transactionId,
        inUtxo: input.inUtxo ?? "0",
        utxo: input.utxo ?? "0",
      },
    });
  }

  async inspectPaymentPrepareRequest(input: {
    verifierPath: string;
    sourceId: "testXRP";
    transactionId: string;
    inUtxo?: string;
    utxo?: string;
  }) {
    return this.inspectAttestationRequest({
      verifierPath: input.verifierPath,
      attestationType: "Payment",
      sourceId: input.sourceId,
      requestBody: {
        transactionId: input.transactionId,
        inUtxo: input.inUtxo ?? "0",
        utxo: input.utxo ?? "0",
      },
    });
  }

  private async prepareAttestationRequest(input: {
    verifierPath: string;
    attestationType: "AddressValidity" | "Payment";
    sourceId: string;
    requestBody: Record<string, unknown>;
  }): Promise<PreparedFdcRequest> {
    const diagnostics = await this.inspectAttestationRequest(input);

    if (!diagnostics.responseOk) {
      throw new Error(`FDC verifier rejected ${input.attestationType} request: ${diagnostics.verifierMessage}`);
    }

    if (diagnostics.status && diagnostics.status !== "VALID") {
      throw new Error(`FDC verifier returned invalid request status for ${input.attestationType}: ${diagnostics.status}`);
    }

    if (!isHex(diagnostics.abiEncodedRequest)) {
      throw new Error(`FDC verifier response missing abiEncodedRequest for ${input.attestationType}; received keys: ${diagnostics.responseKeys.join(", ") || "none"}; message: ${diagnostics.verifierMessage}`);
    }

    return {
      abiEncodedRequest: diagnostics.abiEncodedRequest,
      status: diagnostics.status,
    };
  }

  private async inspectAttestationRequest(input: {
    verifierPath: string;
    attestationType: "AddressValidity" | "Payment";
    sourceId: string;
    requestBody: Record<string, unknown>;
  }) {
    const payload = {
      attestationType: toUtf8HexString(input.attestationType),
      sourceId: toUtf8HexString(input.sourceId),
      requestBody: input.requestBody,
    };
    const response = await this.fetchFn(`${this.verifierUrl}verifier/${input.verifierPath}/${input.attestationType}/prepareRequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.apiKey ? { "X-API-KEY": this.apiKey } : {}),
      },
      body: JSON.stringify(payload),
    });
    const contentType = response.headers.get("content-type") ?? "";
    const body = await response.text();
    const data = parseJsonObject(body);
    const responseKeys = data ? Object.keys(data) : [];
    const abiEncodedRequest = typeof data?.abiEncodedRequest === "string" ? data.abiEncodedRequest : undefined;
    const status = typeof data?.status === "string" ? data.status : undefined;
    const verifierMessage = safeVerifierMessage(data, body) ?? `HTTP ${response.status}`;
    const verifierAccepted = response.ok && (!status || status === "VALID") && isHex(abiEncodedRequest);

    return {
      attestationType: input.attestationType,
      sourceId: input.sourceId,
      requestBody: input.requestBody,
      requestBodyFields: Object.keys(input.requestBody),
      verifierHttpStatus: response.status,
      verifierContentType: contentType,
      responseOk: response.ok,
      verifierAccepted,
      abiEncodedRequestPresent: typeof abiEncodedRequest === "string",
      abiEncodedRequest,
      abiEncodedRequestPreview: abiEncodedRequest ? previewHex(abiEncodedRequest) : undefined,
      status,
      responseKeys,
      verifierMessage,
      encodedAttestationType: payload.attestationType,
      encodedSourceId: payload.sourceId,
    };
  }

  async submitAttestationRequest(abiEncodedRequest: string) {
    if (!this.privateKey && !this.contracts?.fdcHub) {
      throw new Error("WORKER_PRIVATE_KEY is required to submit FDC attestation requests");
    }

    const fdcHubMetadata = await this.getContractMetadata("FdcHub", Boolean(this.contracts?.fdcHub));
    const fdcHub = await this.getFdcHub();
    const feeConfigurations = await this.getFeeConfigurations();
    let requestFee: bigint;

    try {
      requestFee = await feeConfigurations.getRequestFee(abiEncodedRequest);
    } catch (error) {
      throw new Error(`FDC request fee retrieval failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }

    const tx = await fdcHub.requestAttestation(abiEncodedRequest, { value: requestFee });
    const receipt = await tx.wait();
    const block = await this.provider.getBlock(receipt.blockNumber);

    if (!block) {
      throw new Error("Unable to load FDC request block");
    }

    const roundId = await this.calculateRoundId(block.timestamp);

    return {
      requestTxHash: receipt.hash ?? tx.hash,
      requestBlockNumber: receipt.blockNumber,
      roundId,
      fdcHubAddress: fdcHubMetadata.address,
      fdcHubAddressSource: fdcHubMetadata.source,
    };
  }

  async waitForRoundFinalization(roundId: number) {
    const relay = await this.getRelay();
    const protocolId = await this.getFdcProtocolId();
    const deadline = Date.now() + this.maxWaitMs;

    while (Date.now() < deadline) {
      if (await relay.isFinalized(protocolId, roundId)) {
        return;
      }

      await sleep(this.pollIntervalMs);
    }

    throw new Error(`FDC round ${roundId} was not finalized before timeout`);
  }

  async retrieveProof(abiEncodedRequest: string, roundId: number): Promise<FdcDaProofResponse> {
    const url = `${this.daLayerUrl}api/v1/fdc/proof-by-request-round-raw`;
    const deadline = Date.now() + this.maxWaitMs;
    let lastError = "";

    while (Date.now() < deadline) {
      const response = await this.fetchFn(url, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify({
          votingRoundId: roundId,
          requestBytes: abiEncodedRequest,
        }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        lastError = `FDC DA layer request failed with status ${response.status}${body ? `: ${body}` : ""}`;
        await sleep(Math.min(this.pollIntervalMs, 5000));
        continue;
      }

      const proof = await response.json() as FdcDaProofResponse;

      if (proof.response_hex ?? proof.responseHex) {
        return proof;
      }

      await sleep(Math.min(this.pollIntervalMs, 5000));
    }

    if (lastError) {
      throw new Error(lastError);
    }

    throw new Error("FDC proof was not available before timeout");
  }

  decodeAddressValidityProof(proof: FdcDaProofResponse): AddressValidityProof {
    const responseHex = proof.response_hex ?? proof.responseHex;
    const merkleProof = proof.proof ?? proof.proofs ?? [];

    if (!isHex(responseHex)) {
      throw new Error("FDC DA layer returned malformed AddressValidity response");
    }

    const [decoded] = AbiCoder.defaultAbiCoder().decode([addressValidityResponseType], responseHex);

    return {
      merkleProof,
      data: {
        attestationType: decoded.attestationType,
        sourceId: decoded.sourceId,
        votingRound: BigInt(decoded.votingRound),
        lowestUsedTimestamp: BigInt(decoded.lowestUsedTimestamp),
        requestBody: {
          addressStr: decoded.requestBody.addressStr,
        },
        responseBody: {
          isValid: Boolean(decoded.responseBody.isValid),
          standardAddress: decoded.responseBody.standardAddress,
          standardAddressHash: decoded.responseBody.standardAddressHash,
        },
      },
    };
  }

  async verifyAddressValidityProof(proof: AddressValidityProof) {
    const verification = await this.getVerification();
    return Boolean(await verification.verifyAddressValidity(proof));
  }

  async getFdcVerificationMetadata() {
    return this.getContractMetadata("FdcVerification", Boolean(this.contracts?.verification));
  }

  decodePaymentProof(proof: FdcDaProofResponse): PaymentProof {
    const responseHex = proof.response_hex ?? proof.responseHex;
    const merkleProof = proof.proof ?? proof.proofs ?? [];

    if (!isHex(responseHex)) {
      throw new Error("FDC DA layer returned malformed Payment response");
    }

    const [decoded] = AbiCoder.defaultAbiCoder().decode([paymentResponseType], responseHex);

    return {
      merkleProof,
      data: {
        attestationType: decoded.attestationType,
        sourceId: decoded.sourceId,
        votingRound: BigInt(decoded.votingRound),
        lowestUsedTimestamp: BigInt(decoded.lowestUsedTimestamp),
        requestBody: {
          transactionId: decoded.requestBody.transactionId,
          inUtxo: BigInt(decoded.requestBody.inUtxo),
          utxo: BigInt(decoded.requestBody.utxo),
        },
        responseBody: {
          blockNumber: BigInt(decoded.responseBody.blockNumber),
          blockTimestamp: BigInt(decoded.responseBody.blockTimestamp),
          sourceAddressHash: decoded.responseBody.sourceAddressHash,
          sourceAddressesRoot: decoded.responseBody.sourceAddressesRoot,
          receivingAddressHash: decoded.responseBody.receivingAddressHash,
          intendedReceivingAddressHash: decoded.responseBody.intendedReceivingAddressHash,
          spentAmount: BigInt(decoded.responseBody.spentAmount),
          intendedSpentAmount: BigInt(decoded.responseBody.intendedSpentAmount),
          receivedAmount: BigInt(decoded.responseBody.receivedAmount),
          intendedReceivedAmount: BigInt(decoded.responseBody.intendedReceivedAmount),
          standardPaymentReference: decoded.responseBody.standardPaymentReference,
          oneToOne: Boolean(decoded.responseBody.oneToOne),
          status: Number(decoded.responseBody.status),
        },
      },
    };
  }

  async verifyPaymentProof(proof: PaymentProof) {
    const verification = await this.getVerification();
    return Boolean(await verification.verifyPayment(proof));
  }

  private async calculateRoundId(blockTimestamp: number) {
    const manager = await this.getFlareSystemsManager();
    const currentVotingEpochId = await manager.getCurrentVotingEpochId?.();

    if (currentVotingEpochId !== undefined) {
      return Number(currentVotingEpochId);
    }

    const firstVotingRoundStartTs = await manager.firstVotingRoundStartTs();
    const votingEpochDurationSeconds = await manager.votingEpochDurationSeconds();

    return Number((BigInt(blockTimestamp) - firstVotingRoundStartTs) / votingEpochDurationSeconds);
  }

  private async getFdcProtocolId() {
    const verification = await this.getVerification();
    return Number(await verification.fdcProtocolId());
  }

  private async getContractMetadata(name: string, injected = false) {
    if (injected) {
      return {
        address: "injected",
        source: "injected" as const,
      };
    }

    const address = await this.getContractAddress(name);

    return {
      address,
      source: "contract-registry" as const,
    };
  }

  private async getContractAddress(name: string) {
    const registry = new Contract(this.contractRegistryAddress, registryAbi, this.provider);
    const address = await registry.getContractAddressByName(name) as string;

    if (!/^0x[0-9a-fA-F]{40}$/.test(address) || address === "0x0000000000000000000000000000000000000000") {
      throw new Error(`FDC contract ${name} could not be resolved from Contract Registry`);
    }

    return address;
  }

  private async getFdcHub(): Promise<NonNullable<FdcContracts["fdcHub"]>> {
    if (this.contracts?.fdcHub) {
      return this.contracts.fdcHub!;
    }

    const signer = new Wallet(this.privateKey, this.provider);
    return new Contract(await this.getContractAddress("FdcHub"), hubAbi, signer) as unknown as NonNullable<FdcContracts["fdcHub"]>;
  }

  private async getFeeConfigurations(): Promise<NonNullable<FdcContracts["feeConfigurations"]>> {
    if (this.contracts?.feeConfigurations) {
      return this.contracts.feeConfigurations!;
    }

    return new Contract(await this.getContractAddress("FdcRequestFeeConfigurations"), feeAbi, this.provider) as unknown as NonNullable<FdcContracts["feeConfigurations"]>;
  }

  private async getFlareSystemsManager(): Promise<NonNullable<FdcContracts["flareSystemsManager"]>> {
    if (this.contracts?.flareSystemsManager) {
      return this.contracts.flareSystemsManager!;
    }

    return new Contract(await this.getContractAddress("FlareSystemsManager"), systemsAbi, this.provider) as unknown as NonNullable<FdcContracts["flareSystemsManager"]>;
  }

  private async getRelay(): Promise<NonNullable<FdcContracts["relay"]>> {
    if (this.contracts?.relay) {
      return this.contracts.relay!;
    }

    return new Contract(await this.getContractAddress("Relay"), relayAbi, this.provider) as unknown as NonNullable<FdcContracts["relay"]>;
  }

  private async getVerification(): Promise<NonNullable<FdcContracts["verification"]>> {
    if (this.contracts?.verification) {
      return this.contracts.verification!;
    }

    return new Contract(await this.getContractAddress("FdcVerification"), verificationAbi, this.provider) as unknown as NonNullable<FdcContracts["verification"]>;
  }
}

export function toUtf8HexString(value: string) {
  return zeroPadBytes(toUtf8Bytes(value), 32);
}

function isHex(value: unknown): value is string {
  return typeof value === "string" && /^0x[0-9a-fA-F]*$/.test(value);
}

function parseJsonObject(value: string): Record<string, unknown> | undefined {
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : undefined;
  } catch {
    return undefined;
  }
}

function safeVerifierMessage(data: Record<string, unknown> | undefined, rawBody: string) {
  const candidates = [
    data?.message,
    data?.error,
    data?.reason,
    data?.details,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.slice(0, 500);
    }
  }

  if (rawBody.trim() && rawBody.length < 500 && !rawBody.includes("PRIVATE KEY")) {
    return rawBody.trim();
  }

  return undefined;
}

function previewHex(value: string) {
  if (value.length <= 24) {
    return value;
  }

  return `${value.slice(0, 12)}...${value.slice(-10)}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureTrailingSlash(value: string) {
  return value.endsWith("/") ? value : `${value}/`;
}
