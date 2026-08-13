# FCC Coston2 Deployment

ProofVault's local FCC foundation is ready, but a REAL FCC status requires deployment through the official Flare FCE/FCC Coston2 flow.

## Current ProofVault Extension

- Extension: `extensions/proofvault-threshold`
- OP type: `PROOFVAULT_RESERVE`
- OP command: `VERIFY_RESERVE_THRESHOLD`
- Worker command: `corepack pnpm --filter @proofvault/worker fcc:threshold:test`

The extension computes `sum(assetValues) >= requiredThreshold` and returns only `thresholdMet`, `outcome`, `outputCommitment`, and safe execution metadata.

## Official Coston2 Lifecycle

The official Flare FCE scaffold flow is:

1. Build the extension using the scaffold language implementation.
2. Deploy/register the `InstructionSender`.
3. Register the extension on-chain and obtain `EXTENSION_ID`.
4. Build a reproducible extension image with `SOURCE_DATE_EPOCH`.
5. Run the extension on a real GCP Confidential Space VM with production attestation (`MODE=0`).
6. Expose the tee-proxy public endpoint.
7. Verify `/info` reports a real GCP AMD SEV platform, the expected extension ID, and a non-simulated code hash.
8. Whitelist/allow the TEE version and register the TEE machine.
9. Run the scaffold end-to-end test against Coston2.
10. Set ProofVault worker `FCC_EXTENSION_ENDPOINT` and `FCC_EXTENSION_ID`.
11. Run `fcc:threshold:test` with `FCC_FALLBACK_ENABLED=false`.

## Required Environment

Create the official scaffold `.env.coston2` with:

```bash
CHAIN=coston2
CHAIN_URL=https://coston2-api.flare.network/ext/C/rpc
ADDRESSES_FILE=./config/coston2/deployed-addresses.json
NORMAL_PROXY_URL=https://tee-proxy-coston2-1.flare.rocks
EXT_PROXY_URL=
LOCAL_MODE=false
SIMULATED_TEE=false
DEPLOYMENT_PRIVATE_KEY=<funded deployer key, no 0x>
INITIAL_OWNER=<deployer address>
CHAIN_ID=114
```

Do not commit `.env.coston2` or any private key.

## Coston2 FCC Addresses

From the official scaffold Coston2 deployment config:

- `FlareTeeManager`: `0x1a9C4A0f9D76c0b1D91d22E24E573a9b377618aE`
- `ExtensionManagerFacet`: `0x13ebf34c3Fd436A657cb0f819c59790dF55CE14B`
- `MachineManagerFacet`: `0xF40B9a2e70EE96042217F10D94A4B1eDf13096a8`
- `InstructionsFacet`: `0xe0958De99d4C9Fcb960AEd936Ba5964506AA62Ff`
- `VerificationFacet`: `0x78203332236cF39A0079746385F33060aCC95778`

Source: official `fce-extension-scaffold/config/coston2/deployed-addresses.json`.

## Commands

From the official scaffold-compatible extension repository:

```bash
bash ./scripts/use-chain.sh coston2
bash ./scripts/pre-build.sh
cat config/extension.env
```

Build the image:

```powershell
$env:SOURCE_DATE_EPOCH = (git log -1 --format=%ct)
docker compose -f docker-compose.yaml build --no-cache extension-tee
docker tag <extension>-extension-tee:latest proofvault-threshold-extension:v0.1.0
docker save proofvault-threshold-extension:v0.1.0 -o proofvault-threshold-extension-v0.1.0.tar
```

Deploy that image to a real GCP Confidential Space VM with `MODE=0`, `CHAIN_ID=114`, `INITIAL_OWNER`, `CHAIN_URL`, `EXTENSION_ID`, and a reachable proxy URL.

After the VM is reachable:

```bash
curl -s "$EXT_PROXY_URL/info" | jq '{extensionId, codeHash, platform}'
bash ./scripts/post-build.sh
bash ./scripts/test.sh
```

Then configure ProofVault worker:

```powershell
$env:FCC_MODE="live"
$env:FCC_FALLBACK_ENABLED="false"
$env:FCC_EXTENSION_ID="<real extension id>"
$env:FCC_EXTENSION_ENDPOINT="<real tee-proxy endpoint>"
corepack pnpm --filter @proofvault/worker fcc:threshold:test
```

## Local Blockers Observed

This machine currently cannot complete the real deployment because:

- Foundry `forge` is not installed.
- Bash is blocked by local access permissions.
- The real flow requires GCP Confidential Space or equivalent Flare-supported TEE infrastructure.
- The official flow requires VPN/indexer access for parts of registration.
- No real `FCC_EXTENSION_ENDPOINT` or `FCC_EXTENSION_ID` is configured.

## Real Status Criteria

FCC can be marked REAL only when:

- A real Coston2 extension ID exists.
- A real non-local tee-proxy endpoint exists.
- `/info` reports a real GCP AMD SEV platform, not simulated mode.
- The extension code hash is registered/allowed.
- A TEE machine is registered and active.
- `fcc:threshold:test` succeeds with `fallbackUsed=false`.
