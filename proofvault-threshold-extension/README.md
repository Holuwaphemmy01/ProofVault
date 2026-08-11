# ProofVault Threshold FCC Extension

Minimal Flare Confidential Compute extension scaffold for ProofVault.

This directory follows the official FCC scaffold ownership points:

- `internal/config/config.go`
- `pkg/types/types.go`
- `internal/extension/extension.go`
- `pkg/types/register.go`
- `contracts/InstructionSender.sol`
- `tools/cmd/run-test/main.go`

Action:

```text
verifyReserveThreshold
```

Private input:

```json
{
  "requestId": "proof-request-id",
  "requiredThreshold": 200000,
  "assetValues": [120000, 100000],
  "commitment": "0x..."
}
```

Safe output:

```json
{
  "thresholdMet": true,
  "outcome": "PASS",
  "outputCommitment": "0x..."
}
```

The extension must not return exact balances, per-wallet values, aggregate reserve value, or treasury strategy.
