# Flare Integration Plan

## Overview

ProofVault will use real minimal integrations with FTSO, FDC, and FCC for the hackathon MVP. The goal is to prove the core architecture with live Flare services where practical, while keeping a clearly labelled fallback path for demo reliability.

ProofVault is a confidential cross-chain proof-of-reserves platform built for Flare. It helps crypto organizations prove reserve health across BTC, XRP, DOGE, FLR, stablecoins, and FAssets without exposing sensitive treasury data.

## Final Integration Decision

| Component | MVP Decision | Purpose | Fallback |
| --- | --- | --- | --- |
| FTSO | Real integration for 1-2 price feeds, starting with FLR/USD and BTC/USD. | Value reserve assets for threshold comparison. | Static demo prices only if live feed fails. |
| FDC AddressValidity | Real AddressValidity attestation. | Validate submitted reserve addresses. | Labelled demo validation if live request or proof retrieval fails. |
| FDC Payment | Real Payment attestation. | Verify external-chain payment evidence connected to reserves. | Labelled demo payment evidence if live attestation fails. |
| FCC | Real minimal compute extension. | Calculate whether total reserve value meets required threshold. | Labelled local worker calculation if FCC setup fails during demo. |
| ProofRegistry contract | Real contract write for public proof result. | Anchor the proof hash and status publicly. | Local/mock contract reference only if testnet transaction fails. |
| Public verifier page | Real public display of proof result. | Show reserve status without private reserve composition. | Demo-mode public result clearly labelled if live services fail. |

## FTSO Integration Plan

ProofVault will read real FTSOv2 price feeds for the MVP. The first target feeds are:

- FLR/USD
- BTC/USD

These prices are used to value reserve assets for threshold comparison. The feed result should include:

- Price
- Decimals
- Timestamp
- Source

Fallback is a static demo price only if the live feed fails. Any fallback value must be clearly labelled as demo data.

## FDC AddressValidity Integration Plan

ProofVault will use real FDC AddressValidity attestation to validate whether a submitted reserve address is valid for its chain. The MVP should start with a BTC testnet address if possible.

The UI should show:

```text
Reserve address validated
```

The public page must not expose the full wallet address. It may show only safe proof status and public verification metadata.

## FDC Payment Attestation Plan

ProofVault will use real FDC Payment attestation to verify external-chain payment transaction evidence connected to reserves. The demo should prefer XRPL payment attestation if practical.

The UI should show:

```text
Reserve payment evidence verified
```

The public page must not expose private treasury movement or exact reserve composition.

## FCC Integration Plan

ProofVault will use a real minimal FCC extension for the MVP. The extension receives:

- `requiredThreshold`
- `assetValues`

The extension computes:

- `totalReserveValue`
- `thresholdMet`

The extension returns only:

- `thresholdMet`
- `proofHash`
- `timestamp`

It must not return wallet-by-wallet balances or private reserve composition.

## ProofRegistry Contract Integration

The ProofRegistry contract stores only the public proof result.

Store:

- Project slug
- Proof hash
- `thresholdMet`
- Status
- Timestamp
- Optional metadata URI

Do not store:

- Full wallet addresses
- Balances
- Payment details
- Private computation trace

## End-to-End Demo Flow

1. User creates reserve proof request.
2. User adds reserve address.
3. FDC AddressValidity validates the reserve address.
4. User adds payment transaction evidence.
5. FDC Payment validates the payment evidence.
6. FTSO reads real price feeds for selected assets.
7. FCC computes whether the reserve threshold is met.
8. Backend receives threshold result and proof hash.
9. ProofRegistry stores public proof result.
10. Public verifier views reserve status without seeing private reserve composition.

## Fallback Strategy

Fallback data is only used if live testnet services fail. The primary demo path must use real Flare integrations.

Fallback mode must be clearly labelled in code or demo mode, and fallback values must still respect ProofVault privacy boundaries. Demo data must not expose full wallet addresses, exact balances, private reserve composition, treasury strategy, or raw worker output.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| FTSO feed integration takes longer than expected | Reserve valuation may not be live in time for demo. | Start with only FLR/USD and BTC/USD, then add static fallback prices labelled as demo mode. |
| FDC AddressValidity request/proof retrieval fails | Reserve address validation may block the main flow. | Prepare a known testnet address and a labelled fallback validation result. |
| FDC Payment attestation is harder than expected | External-chain payment evidence may not be live for demo. | Prefer the most practical XRPL payment attestation path and keep a labelled fallback evidence result. |
| FCC setup takes longer than expected | Confidential threshold calculation may not run through FCC. | Implement the smallest possible extension and keep the worker calculation as a labelled fallback. |
| Testnet instability during demo | Live transactions or attestations may fail in front of judges. | Pre-test demo inputs, keep screenshots/logs, and switch only to clearly labelled fallback mode if needed. |
| Public page exposes too much information | Privacy promise is weakened and acceptance criteria may fail. | Restrict public UI to status, threshold result, supported assets, proof hash, timestamp, verification mode, and on-chain reference. |

## Implementation Timeline

| Workstream | Estimate |
| --- | --- |
| FTSO | 2-4 days |
| FDC AddressValidity | 3-5 days |
| FDC Payment | 4-7 days |
| FCC minimal extension | 5-10 days |
| ProofRegistry integration | 2-4 days |
| API/frontend glue | 3-5 days |
| Demo testing/fallback setup | 2-4 days |

## Acceptance Checklist

- [ ] FTSO real integration path documented
- [ ] FDC AddressValidity path documented
- [ ] FDC Payment attestation path documented
- [ ] FCC minimal extension path documented
- [ ] ProofRegistry on-chain storage boundary documented
- [ ] End-to-end demo flow documented
- [ ] Fallback strategy documented
- [ ] Risks and mitigations documented
- [ ] Public verifier does not expose private reserve composition
- [ ] Public data does not expose wallet strategy
