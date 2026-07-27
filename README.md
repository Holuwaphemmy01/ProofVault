# ProofVault

**Confidential cross-chain proof-of-reserves for crypto organizations.**

ProofVault helps exchanges, DAOs, bridges, lending protocols, stablecoin issuers, and asset-backed protocols prove reserve health without exposing sensitive treasury data.

## Overview

ProofVault is a hackathon project built around confidential proof-of-reserves for interoperable crypto assets. Organizations can prove they have enough reserves across BTC, XRP, DOGE, FLR, stablecoins, and FAssets while keeping wallet addresses, exact balances, fund movement, and treasury strategy private.

## Problem

Proof-of-reserves is difficult when reserves are spread across multiple chains and assets. Publicly revealing every wallet and balance can create security and strategy risks, while screenshots or manual claims do not give users reliable verification.

## Solution

ProofVault turns private reserve data into a public verification result. A project submits reserve sources, runs a confidential verification flow, and publishes only the reserve status, proof hash, timestamp, supported assets, and on-chain proof reference.

## Bounties Targeted

- **Interoperable Asset Products**: cross-chain reserve verification for BTC, XRP, DOGE, FLR, stablecoins, and FAssets.
- **Confidential Compute Apps**: private reserve checks that avoid exposing sensitive treasury data.

## Architecture Overview

ProofVault is organized as a pnpm monorepo with separate packages for the frontend, smart contracts, backend API, mock verification worker, and documentation.

```text
proofvault/
  apps/
    web/
  contracts/
  services/
    api/
    worker/
  docs/
  README.md
  package.json
  pnpm-workspace.yaml
  .env.example
```

## Monorepo Structure

- `apps/web`: Next.js frontend starter.
- `contracts`: Hardhat smart contract package.
- `services/api`: Fastify backend API.
- `services/worker`: TypeScript confidential verification simulator.
- `docs`: Product, architecture, and demo documentation.

## Apps and Services

- **Web app**: provides the starter user interface for creating reserve proofs and verifying projects.
- **Contracts**: stores proof records such as project name, proof hash, status, timestamp, and creator.
- **API**: exposes health and placeholder proof endpoints.
- **Worker**: simulates confidential reserve verification and proof hash generation.

## Tech Stack

- pnpm workspaces
- Next.js, React, TypeScript, Tailwind CSS
- Fastify, Zod, dotenv
- Hardhat, Solidity, ethers
- TypeScript worker service

## Getting Started

```bash
pnpm install
cp .env.example .env
pnpm dev:web
pnpm dev:api
pnpm dev:worker
```

## Available Scripts

- `pnpm dev:web`
- `pnpm dev:api`
- `pnpm dev:worker`
- `pnpm build:web`
- `pnpm build:api`
- `pnpm build:worker`
- `pnpm compile:contracts`
- `pnpm test:contracts`

## Demo Flow Placeholder

1. Create a reserve proof request.
2. Add cross-chain reserve sources.
3. Run simulated confidential verification.
4. Generate a proof hash and timestamp.
5. Publish or view the public reserve status.

## Documentation Links

- [Demo Acceptance Criteria](./docs/demo-acceptance-criteria.md)
- [User Journey](./docs/user-journey.md)
- [Product Requirements](./docs/product-requirements.md)
- [Architecture](./docs/architecture.md)
- [Privacy Boundary](./docs/privacy-boundary.md)
- [Demo Script](./docs/demo-script.md)

## Project Status

Repository setup is complete. The current version includes starter packages, mock services, placeholder routes, a simple proof registry contract, and documentation scaffolding. Full product screens, wallet integrations, Flare RPC integration, real confidential compute, and database setup are not implemented yet.

## License

License to be decided.
