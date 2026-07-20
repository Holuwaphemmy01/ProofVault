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
