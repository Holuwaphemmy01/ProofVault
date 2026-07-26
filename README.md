# ProofVault

ProofVault is a confidential cross-chain proof-of-reserves platform built for Flare.

## Overview

ProofVault helps crypto projects, exchanges, DAOs, bridges, lending protocols, stablecoin issuers, and asset-backed protocols prove reserve health without exposing sensitive treasury data.

## Monorepo Structure

```text
apps/web        frontend
contracts       smart contracts
services/api    backend API
services/worker confidential verification simulator
docs            product and technical docs
```

## Apps and Services

- `apps/web`: Next.js frontend starter.
- `contracts`: Hardhat TypeScript smart contract package.
- `services/api`: Fastify TypeScript API with mock proof routes.
- `services/worker`: TypeScript worker that simulates proof verification.
- `docs`: Product and technical documentation placeholders.

## Getting Started

```bash
pnpm install
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

## Documentation

See the files in `docs/` for the demo acceptance criteria, user journey, product requirements, architecture notes, and demo script.
