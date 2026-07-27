# Privacy Boundary

## Overview

ProofVault turns private reserve data into a public proof result. Crypto organizations can prove reserve health without publicly exposing sensitive treasury data, including wallet strategy, exact private reserve composition, full wallet addresses, exact wallet balances, treasury movement, or internal reserve calculations.

The privacy boundary defines which data can appear publicly, which data must remain private, which data should be encrypted, which data exists only inside the worker, and which data may be written on-chain.

## Privacy Principle

If the data can reveal where the money is, how much is in each wallet, or how the treasury is managed, it must not be public.

## Data Categories

### Public Data

Public data can appear on the public verification page and in public proof summaries.

- Project name
- Project slug
- Project type
- Reserve status
- Threshold result
- Supported assets
- Proof hash
- Timestamp
- Verification mode
- On-chain proof reference

### Private Data

Private data must not be shown on the public verification page or written to the smart contract.

- Full wallet addresses
- Exact asset balances
- Exact reserve value per wallet
- Treasury movement
- Internal reserve strategy
- Wallet grouping logic
- Private calculation details
- Worker computation trace

### Encrypted Data

Encrypted data is sensitive input or evidence that should be protected before storage or processing. In the hackathon MVP, encryption may be simulated or documented; in the full version, this boundary should be enforced.

- Wallet addresses
- Raw reserve source data
- Signed ownership proofs
- Balance evidence
- Verification job payload
- Worker input bundle
- Private reserve metadata

### Worker-Only Data

Worker-only data exists inside the confidential verification worker during proof processing. It should not be returned to the frontend, written on-chain, or included in public API responses.

- Raw balances
- Asset-by-asset valuation
- Wallet-by-wallet reserve value
- Full reserve composition
- Threshold calculation steps
- Internal verification logic
- Computation trace
- Temporary verification evidence

### On-Chain Data

On-chain data is public and permanent, so the ProofRegistry smart contract should store only the minimum public proof result.

- Project slug or project ID
- Proof request ID
- Proof hash
- Status
- Threshold met true or false
- Timestamp
- Metadata URI

On-chain data must not include:

- Full wallet addresses
- Exact balances
- Exact USD value per wallet
- Private reserve composition
- Treasury strategy
- Raw worker output

## Privacy Boundary Table

| Data | Public Page | Backend API | Worker | On-Chain | Notes |
| --- | --- | --- | --- | --- | --- |
| Project name | Yes | Yes | Optional | Optional | Safe public identifier. |
| Project slug | Yes | Yes | Optional | Yes | Public routing and proof identifier. |
| Project type | Yes | Yes | Optional | Optional | Safe category such as exchange, DAO, or bridge. |
| Required threshold | Result only | Yes | Yes | Optional | Public page should show threshold result, not private reserve composition. |
| Supported assets | Yes | Yes | Yes | Optional | Asset list is public; balances are private. |
| Full wallet address | No | Encrypted only | Yes | No | Must never be public. |
| Masked wallet address | No | Internal only | Optional | No | May support private admin review; avoid public display. |
| Wallet address hash | No | Internal only | Optional | No | Internal matching field; not a public privacy guarantee. |
| Exact wallet balance | No | Encrypted only | Yes | No | Must never be public. |
| Asset USD value per wallet | No | Private only | Yes | No | Must never reveal per-wallet valuation. |
| Total reserve value | No | Private/Internal | Yes | No | Public result should show only whether threshold was met. |
| Threshold met | Yes | Yes | Yes | Yes | Safe public boolean/result. |
| Proof hash | Yes | Yes | Yes | Yes | Public commitment to the verification result. |
| Transaction hash | Yes | Yes | No | Yes | Public on-chain reference after submission. |
| Timestamp | Yes | Yes | Yes | Yes | Safe public proof time. |
| Internal computation trace | No | No | Yes | No | Worker-only; never expose logs or traces publicly. |
| Treasury strategy | No | Private only | Optional | No | Must never be public. |

## Public Verification Page Rules

The public verification page may show only:

- Project name
- Reserve status
- Threshold result
- Supported assets
- Proof hash
- Timestamp
- Verification mode
- On-chain proof reference

It must not show wallet-level data, raw reserve calculations, exact reserve composition, or treasury strategy.

## What Must Never Be Public

- Full wallet addresses
- Exact balances
- Exact value per wallet
- How funds are distributed
- Which wallet is cold storage
- Which wallet is hot wallet
- Treasury movement
- Internal worker logs
- Raw reserve calculations

## MVP Privacy Approach

For the hackathon MVP:

- The worker may simulate confidential verification.
- Sensitive values should still be treated as private in the UI and docs.
- The public result should only show safe proof data.
- Mock data must still follow the privacy boundary.

## Full Version Privacy Approach

For the full version:

- Reserve inputs should be encrypted before processing.
- Confidential compute / TEE-style verification can process sensitive data.
- Only signed final proof results should be published.
- The smart contract should store minimal public proof data.

## Acceptance Checklist

- [ ] Public data is clearly defined
- [ ] Private data is clearly defined
- [ ] Encrypted data is clearly defined
- [ ] Worker-only data is clearly defined
- [ ] On-chain data is clearly defined
- [ ] Public verification page rules are documented
- [ ] Sensitive wallet strategy is not exposed
- [ ] Exact private reserve composition is not exposed
- [ ] MVP and full-version privacy approaches are documented
