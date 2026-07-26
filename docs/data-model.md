# ProofVault Data Model

ProofVault is a confidential cross-chain proof-of-reserves platform built for Flare. It helps crypto organizations prove reserve health across assets like BTC, XRP, DOGE, FLR, stablecoins, and FAssets without exposing sensitive treasury data.

This document describes the product data model only. It does not define database migrations, backend implementation, or smart contract code.

## Model Relationship

```text
Project
  -> ProofRequest
      -> AssetBalance[]
      -> ProofResult
          -> VerificationBadge
```

## Privacy Boundaries

### Public Data

Public data can be shown on the public verification page or included in a public proof result:

- Project name
- Project type
- Reserve status
- Threshold result
- Supported assets
- Proof hash
- Timestamp
- On-chain proof reference
- Verification mode

### Private Data

Private data must not be exposed publicly:

- Full wallet addresses
- Exact wallet balances
- Exact USD value per wallet
- Treasury movement
- Internal reserve strategy
- Raw confidential computation output

### Internal Data

Internal data may be stored or processed by backend systems but should not be shown publicly unless explicitly transformed into safe public data:

- Project ID
- Proof request ID
- Wallet address hash
- Masked wallet address
- Validation status
- Worker job status

### On-Chain Data

On-chain data should be minimized because it is public and permanent:

- Project identifier
- Proof request ID
- Proof hash
- Status
- Timestamp
- Supported assets or metadata URI

## Project

The `Project` model represents an organization that wants to prove reserve health or be publicly verified.

| Field name | Type | Visibility | Description | Privacy notes |
| --- | --- | --- | --- | --- |
| `id` | `string` | Internal | Unique project identifier. | Internal ID; not required for public display. |
| `name` | `string` | Public | Public project or organization name. | Safe to show on verification pages. |
| `slug` | `string` | Public | URL-safe project identifier. | Can be used for public verification routes. |
| `projectType` | `string` | Public | Exchange, DAO, bridge, lending protocol, stablecoin issuer, or asset-backed protocol. | Safe category, not treasury detail. |
| `verificationMode` | `string` | Public | Verification approach, such as simulated confidential verification for MVP. | Should not expose raw compute details. |
| `createdAt` | `string` | Internal | Project creation timestamp. | Usually internal metadata. |
| `updatedAt` | `string` | Internal | Last update timestamp. | Usually internal metadata. |

```ts
export interface Project {
  id: string;
  name: string;
  slug: string;
  projectType: string;
  verificationMode: "simulated-confidential" | "confidential-compute";
  createdAt: string;
  updatedAt: string;
}
```

## ProofRequest

The `ProofRequest` model represents a reserve proof job created by a project. It defines what needs to be verified and the threshold the reserves must meet.

| Field name | Type | Visibility | Description | Privacy notes |
| --- | --- | --- | --- | --- |
| `id` | `string` | Internal / On-chain | Unique proof request identifier. | Can be written on-chain if it does not reveal sensitive context. |
| `projectId` | `string` | Internal | ID of the project that owns the request. | Internal relationship field. |
| `projectName` | `string` | Public | Public project name for display. | Safe to show publicly. |
| `requiredThresholdUsd` | `number` | Internal | Required reserve threshold in USD. | Public views should show only threshold result unless disclosure is intended. |
| `supportedAssets` | `string[]` | Public / On-chain | Assets included in the proof, such as BTC, XRP, DOGE, FLR, stablecoins, or FAssets. | Asset list is public; balances are not. |
| `status` | `string` | Internal | Request workflow status. | Worker job status is internal. |
| `workerJobStatus` | `string` | Internal | Current worker processing state. | Not public; useful for backend operations. |
| `createdAt` | `string` | Internal | Request creation timestamp. | Internal until represented by a public proof timestamp. |

```ts
export interface ProofRequest {
  id: string;
  projectId: string;
  projectName: string;
  requiredThresholdUsd: number;
  supportedAssets: Array<"BTC" | "XRP" | "DOGE" | "FLR" | "USDC" | "FAssets">;
  status: "draft" | "pending" | "verifying" | "completed" | "failed";
  workerJobStatus: "queued" | "running" | "finished" | "error";
  createdAt: string;
}
```

## AssetBalance

The `AssetBalance` model represents an individual reserve source included in a proof request. It must protect wallet-level data and exact balances.

| Field name | Type | Visibility | Description | Privacy notes |
| --- | --- | --- | --- | --- |
| `assetSymbol` | `string` | Public | Asset symbol, such as BTC, XRP, DOGE, FLR, USDC, or FAssets. | Safe to show as part of supported assets. |
| `chain` | `string` | Public / Internal | Source chain or network. | Chain may be public, but should not reveal exact wallet strategy. |
| `walletAddress` | `string` | Private | Full reserve wallet address. | Must never be public. |
| `walletAddressHash` | `string` | Internal | Hash of the wallet address. | Used for internal matching without exposing the address. |
| `maskedWalletAddress` | `string` | Internal | Partially redacted wallet address. | Can support admin review; public use should be carefully limited. |
| `exactBalance` | `number` | Private | Exact asset balance for a wallet/source. | Must never be public. |
| `exactUsdValue` | `number` | Private | Exact USD value for a wallet/source. | Must never be public. |
| `validationStatus` | `string` | Internal | Whether the source has been validated. | Internal workflow state. |

```ts
export interface AssetBalance {
  assetSymbol: "BTC" | "XRP" | "DOGE" | "FLR" | "USDC" | "FAssets";
  chain: string;
  walletAddress: string;
  walletAddressHash: string;
  maskedWalletAddress: string;
  exactBalance: number;
  exactUsdValue: number;
  validationStatus: "pending" | "valid" | "invalid";
}
```

## ProofResult

The `ProofResult` model represents the output of a verification run. Public fields should prove reserve status without exposing raw reserve calculations or wallet-level details.

| Field name | Type | Visibility | Description | Privacy notes |
| --- | --- | --- | --- | --- |
| `id` | `string` | Internal | Unique proof result identifier. | Internal relationship field. |
| `proofRequestId` | `string` | Internal / On-chain | Proof request connected to this result. | Can be on-chain if safe and non-sensitive. |
| `projectIdentifier` | `string` | Public / On-chain | Project slug or other public identifier. | Should not reveal private organization metadata. |
| `reserveStatus` | `string` | Public / On-chain | Final reserve status, such as passed or failed. | Safe public result. |
| `thresholdResult` | `string` | Public | Human-readable threshold result. | Should avoid exact private balances. |
| `supportedAssets` | `string[]` | Public / On-chain | Assets covered by the proof. | Public asset coverage only. |
| `proofHash` | `string` | Public / On-chain | Hash generated from the verification result. | Does not expose raw confidential inputs. |
| `timestamp` | `string` | Public / On-chain | Verification completion timestamp. | Safe to show publicly. |
| `onChainProofReference` | `string` | Public | Contract address, transaction hash, proof ID, or explorer reference. | Safe public anchor. |
| `rawComputationOutput` | `unknown` | Private | Raw worker or confidential computation output. | Must never be public. |

```ts
export interface ProofResult {
  id: string;
  proofRequestId: string;
  projectIdentifier: string;
  reserveStatus: "passed" | "failed";
  thresholdResult: "met" | "not_met";
  supportedAssets: string[];
  proofHash: string;
  timestamp: string;
  onChainProofReference?: string;
  rawComputationOutput?: unknown;
}
```

## VerificationBadge

The `VerificationBadge` model represents the public badge or display state shown after a proof result is available.

| Field name | Type | Visibility | Description | Privacy notes |
| --- | --- | --- | --- | --- |
| `projectName` | `string` | Public | Project name displayed on the badge. | Safe public label. |
| `reserveStatus` | `string` | Public | Passed or failed reserve status. | Safe public result. |
| `verificationMode` | `string` | Public | Verification mode used for the proof. | Should not expose confidential worker internals. |
| `proofHash` | `string` | Public | Public proof hash. | Safe public commitment. |
| `timestamp` | `string` | Public | Time the proof was generated. | Safe public metadata. |
| `onChainProofReference` | `string` | Public | Link or identifier for the on-chain proof record. | Safe public anchor. |

```ts
export interface VerificationBadge {
  projectName: string;
  reserveStatus: "passed" | "failed";
  verificationMode: "simulated-confidential" | "confidential-compute";
  proofHash: string;
  timestamp: string;
  onChainProofReference?: string;
}
```

## What Goes On-Chain

Only the minimum public proof result should be written to the ProofRegistry smart contract. On-chain data should be enough for public verification but should not expose sensitive treasury details.

Recommended on-chain fields:

- Project identifier
- Proof request ID
- Proof hash
- Status
- Timestamp
- Supported assets or metadata URI

The smart contract should not store full wallet addresses, exact balances, raw reserve calculations, treasury movement, or confidential worker traces.

## What Must Never Be Public

- Full wallet addresses
- Exact balances
- Raw reserve calculations
- Treasury movement
- Internal reserve strategy
- Confidential worker traces

## Acceptance Checklist

- [ ] Project model documented
- [ ] ProofRequest model documented
- [ ] AssetBalance model documented
- [ ] ProofResult model documented
- [ ] VerificationBadge model documented
- [ ] Privacy boundaries documented
- [ ] On-chain data boundaries documented
- [ ] TypeScript interfaces included
- [ ] Public vs private data separation is clear
