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


## User Personas and Jobs To Be Done

ProofVault is designed for two main user groups: organizations that need to prove reserve health, and public users who need to verify those claims.

### Persona 1: Reserve Prover

The Reserve Prover is a crypto project, exchange, DAO, bridge, lending protocol, stablecoin issuer, or asset-backed protocol that needs to prove it has enough reserves.

Examples include:

- Crypto exchanges proving user funds are backed.
- DAOs proving treasury strength.
- Bridges proving locked assets exist.
- Lending protocols proving liquidity reserves.
- Asset-backed token projects proving collateral coverage.

#### Needs

The Reserve Prover needs to:

1. Prove that reserves meet a required threshold.
2. Verify assets across multiple chains and wallets.
3. Avoid exposing all wallet addresses publicly.
4. Avoid revealing exact treasury balances and internal fund strategy.
5. Publish a trusted, verifiable proof result.
6. Build user confidence without relying only on screenshots or manual audits.

#### Pain Points

Current proof-of-reserve methods can be limited because:

1. They may require public wallet disclosure.
2. They may expose sensitive treasury movement.
3. They may be limited to one blockchain.
4. They may depend on centralized auditors.
5. They may not provide a simple public verification experience.

#### Jobs To Be Done

When I am managing a crypto project, exchange, DAO, or asset-backed protocol, I want to prove that my reserves meet a required threshold across multiple assets and chains, so that users can trust my platform without forcing me to expose sensitive treasury details.

#### Success Criteria

The Reserve Prover is successful when:

1. A reserve proof request is created.
2. Wallet and asset data are verified privately.
3. The required reserve threshold is checked.
4. A proof result is published on-chain.
5. Public users can verify the result without seeing sensitive internal reserve data.

---

### Persona 2: Public Verifier

The Public Verifier is an everyday user, investor, depositor, DAO member, ecosystem participant, or researcher who wants to check whether a project’s reserve claim is true.

Examples include:

- A user checking if an exchange is solvent.
- A DAO member checking treasury backing.
- A depositor checking if a lending protocol has enough liquidity.
- A token holder checking if an asset-backed token is properly collateralized.
- A researcher comparing reserve health across projects.

#### Needs

The Public Verifier needs to:

1. Confirm whether a project has enough reserves.
2. View a simple reserve status.
3. Trust the proof without reading complex blockchain data.
4. See when the proof was last verified.
5. Confirm that the proof result was published on-chain.
6. Avoid relying only on project claims, screenshots, or social media announcements.

#### Pain Points

Public users often struggle because:

1. Reserve data is hard to understand.
2. Wallet addresses may be scattered across multiple chains.
3. Projects may make claims without verifiable proof.
4. Manual verification is time-consuming.
5. Exact balances can change quickly.
6. Users may not know how to interpret blockchain explorers.

#### Jobs To Be Done

When I am evaluating a crypto project, exchange, DAO, or asset-backed protocol, I want to quickly verify whether its reserves meet a stated threshold, so that I can make a safer decision before trusting, depositing, investing, or participating.

#### Success Criteria

The Public Verifier is successful when:

1. They can search for a project.
2. They can view the project’s reserve status.
3. They can see whether the proof passed or failed.
4. They can view the proof hash and timestamp.
5. They can understand the result without needing advanced technical knowledge.
