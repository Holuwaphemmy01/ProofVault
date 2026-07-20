## Hackathon Bounty Alignment

ProofVault is designed to fit both Flare Summer Signal bounty categories.

### Bounty 1 — Interoperable Asset Products

ProofVault enables projects, DAOs, exchanges, and protocols to prove reserves across multiple assets such as BTC, XRP, DOGE, FLR, stablecoins, and future FAssets. Instead of limiting proof-of-reserves to one chain, ProofVault creates a cross-chain reserve verification layer where different asset balances can be checked, valued, and combined into one public reserve status.

### Bounty 2 — Confidential Compute Apps

ProofVault uses confidential computation to protect sensitive treasury data. Projects can prove that their reserves meet a required threshold without publicly exposing every wallet address, exact balance, or internal treasury strategy. The confidential verifier calculates the reserve status privately and publishes only a signed proof result on-chain.

This makes ProofVault a privacy-preserving proof-of-reserves system for interoperable assets on Flare.



## Problem Statement

Crypto projects, exchanges, DAOs, bridges, and asset-backed protocols often claim that they have enough reserves to back user deposits, token supply, or treasury obligations. However, users usually have no simple way to verify whether these claims are true, especially when the reserves are spread across multiple blockchains such as Bitcoin, XRP Ledger, Dogecoin, Ethereum, Flare, and stablecoin networks.

Existing proof-of-reserve approaches are often limited, manual, or overly transparent. Some require projects to publicly reveal wallet addresses and exact balances, which can expose treasury strategy, create security risks, and allow competitors or attackers to monitor fund movement. Other approaches rely heavily on screenshots, centralized attestations, or periodic audits, which do not provide continuous, verifiable, on-chain assurance.

This creates a trust gap: users need confidence that a project is solvent, while projects need a privacy-preserving way to prove reserve health without exposing sensitive treasury details.

ProofVault solves this by enabling confidential cross-chain proof-of-reserves. Projects can prove that their total reserves meet a required threshold across multiple assets and chains, while only publishing a verified pass/fail result, proof hash, timestamp, and reserve status on-chain.


## MVP Scope and Non-Goals

### Hackathon MVP Scope

For the hackathon, ProofVault will focus on a simple but complete proof-of-reserves flow.

The MVP will allow a project to create a reserve proof request, provide reserve wallet information, define a required reserve threshold, run a confidential reserve verification process, and publish a signed proof result on-chain.

The MVP will include:

1. A basic project dashboard for creating a reserve proof request.
2. Input fields for project name, required reserve amount, supported asset type, and wallet address.
3. A confidential verifier service that simulates private reserve calculation.
4. Price conversion logic for estimating reserve value in USD.
5. A smart contract that stores the final proof result.
6. A public verification page where users can view the project’s reserve status.
7. A demo flow showing how a project proves it has enough reserves without exposing sensitive treasury details.

The MVP is designed to prove the core idea: a project should be able to prove solvency across assets while keeping sensitive reserve data private.

### Non-Goals for the Hackathon

To avoid scope creep, the following features will not be built during the hackathon MVP:

1. Full production-grade proof-of-reserves audit system.
2. Real exchange integrations.
3. Full support for every blockchain and wallet type.
4. Advanced Merkle-tree user liability proofs.
5. Full institutional compliance dashboard.
6. Automated continuous monitoring for all wallets.
7. Multi-organization team management.
8. Paid subscription billing.
9. Full legal/audit reporting.
10. Production security certification.

These features are important, but they are post-hackathon improvements. The hackathon version will focus only on proving the main technical and product concept clearly.
