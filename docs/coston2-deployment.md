# Coston2 Deployment

ProofVaultRegistry must be deployed only to Flare Testnet Coston2 for the hackathon demo.

## Network

- Network: Coston2
- Chain ID: 114
- RPC: `https://coston2-api.flare.network/ext/C/rpc`
- Explorer: `https://coston2-explorer.flare.network`

## Required Environment

Set these locally before deployment. Do not commit private keys.

```bash
COSTON2_RPC_URL=https://coston2-api.flare.network/ext/C/rpc
DEPLOYER_PRIVATE_KEY=<funded-coston2-private-key>
```

## Deploy

```bash
corepack pnpm --filter @proofvault/contracts compile
corepack pnpm --filter @proofvault/contracts test
corepack pnpm --filter @proofvault/contracts run deploy:coston2
```

The deployment script prints public deployment metadata and writes `deployments/coston2.json`.

## Service Configuration

After deployment, set:

```bash
RPC_URL=https://coston2-api.flare.network/ext/C/rpc
PROOFVAULT_REGISTRY_ADDRESS=<deployed-registry-address>
CHAIN_ID=114
```

The worker must sign proof results using the same registry address and chain ID.

## Smoke Test

Set:

```bash
PROOFVAULT_REGISTRY_ADDRESS=<deployed-registry-address>
WORKER_PRIVATE_KEY=<worker-signer-private-key>
```

Then run:

```bash
corepack pnpm --filter @proofvault/contracts run smoke:coston2
```

The smoke script performs:

- `ProjectRegistered`
- `WorkerSignerUpdated`
- `ProofRequestCreated`
- `ProofResultSubmitted`
- Latest proof read
- Proof history read

Only public transaction hashes and proof metadata should be recorded.
