# ProofVault Privacy Boundary

ProofVault separates public proof data from private treasury data. The goal is to let crypto organizations prove reserve health without exposing wallet strategy, exact private reserve composition, or raw confidential verification output.

## Boundary Summary

| Boundary | Stored where | Visible to public | Purpose |
| --- | --- | --- | --- |
| Public proof data | Frontend, API, ProofRegistry smart contract | Yes | Lets anyone verify reserve status. |
| Private encrypted inputs | Backend API storage before worker processing | No | Preserves sensitive reserve source data. |
| Worker-only computation data | Confidential verification worker runtime | No | Calculates reserve health without publishing raw inputs or traces. |
| Internal operational metadata | Backend API storage | No | Tracks requests, validation state, and worker job state. |

## Public Data

Public data is safe to show on the public verification page and, when needed, write to the ProofRegistry smart contract.

| Data | Location | Privacy rule |
| --- | --- | --- |
| Project name | Frontend, API | Public display is allowed. |
| Project type | Frontend, API | Public category is allowed. |
| Reserve status | Frontend, API, smart contract | Public result only: passed, failed, or pending. |
| Threshold result | Frontend, API | Show whether the threshold was met, not the exact hidden composition. |
| Supported assets | Frontend, API, optional on-chain metadata | Public asset coverage is allowed. |
| Proof hash | Frontend, API, smart contract | Public commitment to the verification result. |
| Timestamp | Frontend, API, smart contract | Public verification time. |
| On-chain proof reference | Frontend, API | Public contract proof ID, transaction hash, or explorer link. |
| Verification mode | Frontend, API | Public mode label, such as simulated confidential verification. |

Public data must not reveal wallet strategy or exact private reserve composition.

## Encrypted Private Data

Private reserve inputs should be encrypted before storage or transit wherever possible. In the hackathon MVP, this boundary is documented and simulated; in the full version, encryption and confidential compute enforcement should be implemented.

| Data | Location | Privacy rule |
| --- | --- | --- |
| Full wallet addresses | Encrypted API storage, worker input | Never public and never on-chain. |
| Exact wallet balances | Encrypted API storage, worker input | Never public and never on-chain. |
| Exact USD value per wallet | Worker input/output before aggregation | Never public; do not expose per-wallet valuation. |
| Reserve source labels | API storage | Treat as private if labels reveal strategy. |
| Internal reserve strategy | API storage or organization input | Never public. |

## Worker-Only Data

Worker-only data exists inside the confidential verification worker while a proof is being processed. It should not be persisted publicly or returned to the frontend.

| Data | Location | Privacy rule |
| --- | --- | --- |
| Raw reserve calculations | Worker runtime | Never public. |
| Raw confidential computation output | Worker runtime | Never public. |
| Per-wallet valuation results | Worker runtime | Never public. |
| Treasury movement analysis | Worker runtime | Never public. |
| Confidential worker traces | Worker runtime logs/traces | Never public; avoid logging sensitive values. |
| Intermediate threshold calculations | Worker runtime | Return only pass/fail and proof hash. |

The worker should return only the minimum verification result:

- Proof request ID
- Reserve status
- Threshold result
- Supported assets
- Proof hash
- Timestamp
- Verification mode

## Internal API Data

Internal API data supports workflow coordination. It can be stored by `services/api`, but it should not be shown to public verifiers.

| Data | Location | Privacy rule |
| --- | --- | --- |
| Project ID | Backend API | Internal relationship key. |
| Proof request ID | Backend API, optional on-chain | Public only if it does not reveal sensitive context. |
| Wallet address hash | Backend API | Internal matching key; do not treat as a substitute for full privacy. |
| Masked wallet address | Backend API | Internal/admin display only unless explicitly approved for public use. |
| Validation status | Backend API | Internal workflow status. |
| Worker job status | Backend API | Internal operational status. |

## Public On-Chain Data

The ProofRegistry smart contract should store only the minimum public proof result.

| Data | On-chain? | Privacy rule |
| --- | --- | --- |
| Project identifier | Yes | Use a public slug, ID, or metadata reference. |
| Proof request ID | Yes | Allowed when it is non-sensitive. |
| Proof hash | Yes | Public commitment to the result. |
| Status | Yes | Public reserve status only. |
| Timestamp | Yes | Public proof time. |
| Supported assets or metadata URI | Optional | Must not resolve to private wallet or balance data. |

## What Must Never Be Public

- Full wallet addresses
- Exact wallet balances
- Exact USD value per wallet
- Raw reserve calculations
- Treasury movement
- Internal reserve strategy
- Raw confidential computation output
- Confidential worker traces
- Exact private reserve composition

## MVP Boundary

For the hackathon MVP:

- Confidential compute is simulated by `services/worker`.
- FDC/external data validation is mocked or documented as future integration.
- FTSO/price feeds are mocked with static values.
- Private reserve inputs should not be displayed in public UI.
- ProofRegistry stores only the public proof result.

## Full-Version Boundary

For the post-hackathon version:

- Private reserve inputs should be encrypted before storage and processing.
- The worker should evolve into a confidential compute or TEE-style verifier.
- FDC should validate external blockchain reserve evidence.
- FTSO should provide live asset price feeds for valuation.
- Public verification should continue to expose only the minimum proof result.

## Acceptance Criteria

- [ ] Public data does not expose wallet strategy.
- [ ] Public data does not expose exact private reserve composition.
- [ ] Full wallet addresses are never public.
- [ ] Exact wallet balances are never public.
- [ ] Raw worker output is never public.
- [ ] On-chain data contains only the minimum public proof result.
- [ ] Worker returns only pass/fail status, threshold result, proof hash, timestamp, supported assets, and verification mode.
