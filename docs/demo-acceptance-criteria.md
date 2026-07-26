## Demo Acceptance Criteria

The ProofVault hackathon demo is considered successful when the user can complete the full end-to-end proof-of-reserves journey from creating a reserve proof request to viewing the public verification result.

### End-to-End Demo Flow

The demo must show the following flow:

1. A user lands on the ProofVault landing page.
2. The user chooses whether to create a reserve proof or verify a project.
3. A reserve prover enters the company dashboard.
4. The reserve prover creates a new reserve proof request.
5. The reserve prover defines the required reserve threshold.
6. The reserve prover selects supported assets such as BTC, XRP, DOGE, FLR, USDC, and FAssets.
7. The reserve prover adds reserve wallet sources.
8. ProofVault runs a confidential verification process.
9. The system generates a proof result.
10. The proof result is published with a proof hash, timestamp, and verification status.
11. A public verifier can search for the project and view the public proof result.

---

### Required Demo Features

For the hackathon demo, the following features must work:

#### 1. Landing Page

The landing page must clearly explain that ProofVault is a confidential cross-chain proof-of-reserves platform.

It must show:

- Product headline
- Short explanation
- Create Reserve Proof button
- Verify a Project button
- Cross-chain reserve message
- Privacy-preserving verification message

#### 2. Role Selection

The user must be able to choose between:

- Reserve Prover
- Public Verifier

The screen must clearly explain the difference between both roles.

#### 3. Company Dashboard

The dashboard must show:

- Company name
- Connected wallet sample
- Current reserve status
- Total proofs
- Passed proofs
- Pending proofs
- Failed proofs
- Recent proof requests
- Create New Proof button

#### 4. Create Reserve Proof

The reserve prover must be able to enter or view:

- Project name
- Project type
- Proof name
- Required reserve threshold
- Supported asset group
- Privacy mode
- Verification frequency

The user must be able to continue to the reserve wallet step.

#### 5. Add Reserve Wallets

The reserve prover must be able to add reserve sources with:

- Asset type
- Chain/network
- Wallet address or source identifier
- Source label
- Visibility preference
- Verification method

The screen must show added reserve sources without exposing full sensitive wallet details.

#### 6. Private Verification

The demo must show a private verification process with steps such as:

- Wallet sources encrypted
- Asset values checked
- Reserve threshold calculated privately
- Proof hash generated
- On-chain proof prepared or published

For the hackathon MVP, this verification can be simulated, but it must clearly explain what would happen in a real confidential compute flow.

#### 7. Proof Result

The final proof result screen must show:

- Reserve status
- Threshold result
- Proof hash
- Timestamp
- Supported assets
- Verification mode
- Public verification link

The result must clearly show whether the reserve proof passed or failed.

#### 8. Public Verification Page

The public verifier must be able to view a simple proof result page showing:

- Project name
- Reserve status
- Threshold result
- Proof hash
- Timestamp
- Supported assets
- On-chain proof reference

The public page must not expose private wallet addresses, exact balances, or treasury strategy.

---

### Privacy Acceptance Criteria

The demo must clearly communicate that ProofVault protects sensitive treasury data.

The public verification result must only reveal:

- Pass/fail reserve status
- Proof hash
- Timestamp
- Supported assets
- On-chain proof record

The public result must not reveal:

- Full wallet addresses
- Exact wallet balances
- Treasury movement
- Internal reserve strategy

---

### Cross-Chain Acceptance Criteria

The demo must clearly show that ProofVault supports reserves across multiple assets and chains.

At minimum, the demo should show sample support for:

- BTC
- XRP
- DOGE
- FLR
- USDC
- FAssets

The demo must explain that reserve sources can come from different chains and still produce one public proof result.

---

### Technical MVP Acceptance Criteria

For the hackathon MVP, the following technical pieces should be shown:

1. A frontend user flow for creating a reserve proof.
2. A mock or working reserve verification process.
3. A generated proof hash.
4. A timestamped verification result.
5. A public verification page.
6. A smart contract or mock on-chain registry that stores the final proof result.
7. A clear explanation of where Flare fits into the architecture.

---

### Flare Integration Acceptance Criteria

The demo must explain how ProofVault uses Flare.

ProofVault should be positioned around:

- Flare for on-chain proof publishing
- Flare ecosystem assets and FAssets for cross-chain reserve use cases
- Flare data infrastructure for asset verification and price/value checks
- Confidential compute for private reserve calculation

Even if some parts are simulated in the MVP, the demo must clearly show how the full version would use Flare’s infrastructure.

---

### Demo Success Checklist

The demo is successful if:

- A judge understands the problem within 30 seconds.
- A judge understands why privacy is needed in proof-of-reserves.
- A judge understands why cross-chain verification matters.
- A judge can see the full flow from reserve proof creation to public verification.
- The public proof result is simple and easy to understand.
- Sensitive treasury data is not exposed in the public view.
- The product clearly fits the hackathon bounty direction.
- The demo looks complete enough to represent a real product vision.