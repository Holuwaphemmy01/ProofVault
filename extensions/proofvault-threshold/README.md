# ProofVault Threshold Extension

Development implementation of the ProofVault confidential threshold action using the Flare FCE/FCC scaffold `/action` wire shape.

## Action

- OP type: `PROOFVAULT_RESERVE`
- OP command: `VERIFY_RESERVE_THRESHOLD`

The action receives confidential integer inputs:

- `requestId`
- `requiredThreshold`
- `assetValues`
- `commitment`

It returns only:

- `thresholdMet`
- `outcome`
- `outputCommitment`
- safe execution metadata

It must not return asset values, wallet balances, total reserve value, wallet addresses, or computation traces.

## Local Commands

```powershell
corepack pnpm --filter proofvault-threshold-extension test
corepack pnpm --filter proofvault-threshold-extension build
```

## Live FCC Status

This extension still needs deployment/registration through the official Flare FCC Coston2 flow before ProofVault can report FCC as real.
