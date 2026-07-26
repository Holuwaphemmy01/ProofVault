# ProofVault

**Confidential cross-chain proof-of-reserves for crypto organizations.**

ProofVault is a privacy-preserving proof-of-reserves platform built for crypto exchanges, DAOs, bridges, lending protocols, stablecoin issuers, and asset-backed protocols.

It allows organizations to prove that they have enough reserves across assets like BTC, XRP, DOGE, FLR, stablecoins, and FAssets without publicly exposing sensitive treasury data such as wallet addresses, exact balances, fund movement, or internal treasury strategy.

---

## Overview

Crypto projects often claim that user funds, treasury assets, or asset-backed tokens are fully reserved. However, users usually have no simple way to verify those claims, especially when reserves are spread across multiple chains and wallets.

Traditional proof-of-reserves approaches can also create privacy and security risks because they may require organizations to reveal wallet addresses, exact balances, and treasury movement.

ProofVault solves this by turning private reserve data into public proof.

The platform allows a project to submit reserve sources, run a confidential verification process, and publish only the final proof result, proof hash, timestamp, and on-chain reference.

---

## Problem

Proof-of-reserves has three major problems:

1. **Reserves are scattered**  
   Crypto organizations may hold reserves across multiple chains, wallets, and assets.

2. **Full transparency can leak strategy**  
   Publicly exposing wallet addresses and balances can reveal treasury behaviour, fund movement, and security-sensitive information.

3. **Users still need proof**  
   Screenshots, claims, and manual reports are not enough when users need confidence that funds are properly backed.

---

## Solution

ProofVault provides a confidential proof-of-reserves workflow.

A reserve prover can:

1. Create a reserve proof request.
2. Define the required reserve threshold.
3. Add cross-chain reserve sources.
4. Run private verification.
5. Generate a proof hash.
6. Publish a public proof result.

A public verifier can:

1. Search for a project.
2. View the reserve status.
3. Check proof hash and timestamp.
4. Confirm the proof result without seeing sensitive treasury data.

---

## Bounties Targeted

ProofVault is designed around two main hackathon directions:

### Interoperable Asset Products

ProofVault supports reserve verification across multiple assets and chains, including BTC, XRP, DOGE, FLR, stablecoins, and FAssets.

The goal is to help projects prove reserve health across different asset sources while producing one public verification result.

### Confidential Compute Apps

ProofVault uses confidential verification to protect sensitive reserve data.

Instead of exposing full wallet addresses, exact balances, and treasury strategy, the system publishes only:

- Reserve status
- Proof hash
- Timestamp
- Supported assets
- On-chain proof reference

---

## Architecture

ProofVault is structured as a monorepo with separate packages for frontend, smart contracts, backend API, verification worker, and documentation.

```text
proofvault/
├── apps/
│   └── web/              # Frontend application
│
├── contracts/            # Smart contracts
│
├── services/
│   ├── api/              # Backend API
│   └── worker/           # Confidential verification simulator
│
├── docs/                 # Product and technical documentation
│
├── README.md
├── package.json
├── pnpm-workspace.yaml
├── .gitignore
└── .env.example