# RentDeposit Shield

[![CI](https://github.com/yuxinNgo/RentDeposit-Shieldd/actions/workflows/ci.yml/badge.svg)](https://github.com/yuxinNgo/RentDeposit-Shieldd/actions/workflows/ci.yml)

RentDeposit Shield is a production-oriented Stellar testnet rental escrow workspace built with Next.js, Soroban smart contracts, Neon Postgres, and real wallet connections through Freighter and Rabet. The product turns the rental security deposit lifecycle into a programmable escrow flow with audit trails, dispute handling, analytics, and submission proof.

## Level 5 Submission Snapshot

| Item | Value |
| --- | --- |
| Public repository | `https://github.com/yuxinNgo/RentDeposit-Shieldd` |
| Commit count | `20+ meaningful commits` |
| Deployment target | Railway |
| Live demo link | `Add your Railway public URL here before final submission` |
| Demo video link | `Add your Loom / YouTube link here before final submission` |
| Contract deployment address | `CDQWMOTD2S6KW6LVNJEUVJBTHXTQMUJLM4NPGEGMME7ZRWWLKEIFDKYW` |
| Contract creation transaction | `c58654dd82c6e493eb5ad21bc486d6f9aa9a5f90c632e18866acf7a89c48745b` |
| Contract interaction transaction | `6b54d3ab274f3f6ce9b63934d9e2a7862fd9bf126cd59bd8037fab55e83923af` |
| Latest workflow proof file | [`docs/submission-proof.json`](docs/submission-proof.json) |

## Requirement Coverage

| Requirement | How this project covers it |
| --- | --- |
| Advanced smart contract development | Soroban contract models a full escrow state machine for case initialization, funding, move-in confirmation, refund request, deduction proposal, dispute handling, and final settlement. |
| Inter-contract / multi-contract workflow | The app installs shared Soroban contract code and deploys fresh escrow contract instances per rental case, then orchestrates the lifecycle through signed wallet actions and synced app state. |
| Event streaming and real-time updates | User actions are persisted as analytics events, wallet interaction records, and audit timeline entries; the frontend refreshes these flows through SWR-backed data fetching and near real-time UI updates. |
| CI/CD pipeline setup | GitHub Actions workflow at [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs lint, typecheck, frontend tests, Soroban contract tests, and production build on push / pull request. |
| Smart contract deployment workflow | Included scripts cover contract build, Wasm install, and on-chain end-to-end execution: `npm run stellar:build`, `npm run stellar:install-code`, and `npm run stellar:onchain:test`. |
| Mobile responsive frontend | The interface is responsive across onboarding, dashboard, cases, analytics, and submission flows. |
| Error handling and loading states | Shared UI primitives handle loading, empty, and error flows via [`src/components/common/loading-state.tsx`](src/components/common/loading-state.tsx), [`src/components/common/error-state.tsx`](src/components/common/error-state.tsx), and [`src/components/common/empty-state.tsx`](src/components/common/empty-state.tsx). |
| Tests for contracts and frontend | The repo contains both Soroban Rust unit tests and frontend/domain tests executed through Vitest. |
| Production-ready architecture | Single-repo app with Next.js API routes, PostgreSQL persistence, environment-driven deploy config, Railway standalone output, healthcheck route, and GitHub Actions CI. |
| Documentation and demo presentation | This README, on-chain proof JSON, screenshots, and the owner-provided demo link/video are the final submission package. |

## Product Overview

- Landlord connects a real Freighter or Rabet wallet.
- Landlord creates a deposit case from the Next.js UI.
- The app deploys a dedicated Soroban escrow contract instance for that case.
- Tenant funds the deposit on Stellar testnet.
- Tenant and landlord confirm lifecycle actions through signed wallet interactions.
- If needed, a mediator resolves the dispute through the contract-governed flow.
- The workspace stores analytics, error logs, audit events, and case state in Neon Postgres.

## Architecture

### Frontend

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- SWR for client data refresh
- Recharts for analytics
- Stellar Wallets Kit for Freighter and Rabet integration

### Smart Contract

- Soroban smart contract written in Rust at [`contracts/rent_deposit_escrow`](contracts/rent_deposit_escrow)
- Main methods:
  - `initialize_case`
  - `fund_deposit`
  - `confirm_move_in`
  - `request_refund`
  - `approve_full_refund`
  - `propose_deduction`
  - `accept_deduction`
  - `open_dispute`
  - `resolve_dispute`
  - `close_case`
  - `get_case`

### Data and Backend

- Next.js API routes provide the app backend inside the same repository
- Neon Postgres stores the workspace application state
- Analytics events, wallet interaction logs, feedback, and audit history are persisted server-side
- Healthcheck route for Railway deployment is exposed at `/api/health`

### Deployment

- Railway hosts the Next.js standalone server
- `railway.toml` defines build and deploy settings
- `npm run build` prepares standalone output and copies required static assets
- `npm run start` binds the standalone server correctly for container environments

## Real On-Chain Proof

The current proof dataset was generated through real Stellar testnet accounts and real app/API flows.

- Contract address: `CDQWMOTD2S6KW6LVNJEUVJBTHXTQMUJLM4NPGEGMME7ZRWWLKEIFDKYW`
- Case id: `case_e68de6cca91a`
- Contract creation tx hash: `c58654dd82c6e493eb5ad21bc486d6f9aa9a5f90c632e18866acf7a89c48745b`
- Deposit funding tx hash: `6b54d3ab274f3f6ce9b63934d9e2a7862fd9bf126cd59bd8037fab55e83923af`
- Move-in confirmation tx hash: `3c17f339a8fc93f8f34a955158d83d6c94703de87d5e7bf3ffbe8efe0472d140`
- Unique wallet addresses recorded: `12`
- Total wallet interactions recorded: `15`
- Feedback responses collected: `8`
- Average feedback rating: `4.6 / 5`

Detailed proof is stored in [`docs/submission-proof.json`](docs/submission-proof.json).

## Testing

### Frontend and domain tests

```bash
npm test
```

Current local result:

- `2` passing frontend test files
- `5` passing frontend tests

### Soroban contract tests

```bash
cargo test --manifest-path contracts/rent_deposit_escrow/Cargo.toml
```

Current local result:

- `18` passing contract tests

### Full local quality checks

```bash
npm run lint
npm run typecheck
npm run build
npm test
cargo test --manifest-path contracts/rent_deposit_escrow/Cargo.toml
```

## CI/CD

GitHub Actions workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

Pipeline stages:

- install frontend dependencies
- lint frontend
- typecheck frontend
- run Vitest frontend tests
- run Soroban contract tests
- build the production app

Deployment workflow:

- push to GitHub
- GitHub Actions validates the repo
- Railway auto-deploys the latest main branch commit
- Railway healthchecks `/api/health`

## Screenshots

### Mobile responsive UI

![Mobile responsive UI](docs/screenshots/cases-mobile.png)

### CI/CD pipeline running

![GitHub Actions CI workflow](docs/screenshots/github-actions-ci.png)

### Test output with 3+ passing tests

![Frontend and contract test output](docs/screenshots/test-output-tests.png)

### Product UI

![Dashboard desktop](docs/screenshots/dashboard-desktop.png)

### Analytics and monitoring

![Analytics and monitoring](docs/screenshots/analytics-desktop.png)

## Wallet Proof

These are the public Stellar testnet wallet addresses used in the proof run.

| Role | User | Wallet address |
| --- | --- | --- |
| `LANDLORD` | `Proof landlord 1` | `GDOFNAHR3KRKXAZLUZ7435PD2ZFADTD4CYB2VBSOLB3IDAOMCDG642JZ` |
| `TENANT` | `Proof tenant 2` | `GBBDUOO2XMOCW4BGYTMWJBVXHRWZUWOKYGPBHJZ6CY5J5K3GZGHV5OKT` |
| `MEDIATOR` | `Proof mediator 3` | `GBNY6MPRM2FFEPXGIJ4J73QUIQECS5GD4SHJHJ6P72HYHWKRPRY5625E` |
| `LANDLORD` | `Proof landlord 4` | `GCPCQAST2TGULIM24FKEUK3M7CLHEWRS76NDXG32VZ3GL2PU6LCHLCOX` |
| `TENANT` | `Proof tenant 5` | `GDA5SL3SM4WDMG3YHPSFNO4A5OHAURJ5AP7OTVUGGICN3ZP5O5LB5LQX` |
| `MEDIATOR` | `Proof mediator 6` | `GCQYXYDW7VFCWFBFQWTZDAMRUBLFILA37ASIIDW6GRL5JJZQADL3EXQD` |
| `LANDLORD` | `Proof landlord 7` | `GCR45LCXSA4F2FXLPEFWLWB4YRUQGHMF74B34MLS6GR72KM2HRWWFUX3` |
| `TENANT` | `Proof tenant 8` | `GDBTQNI6CUPIGJCFXC54D6TXSCAP7UJTB2CKXYNYRTUYRO2EMM4Q3JJD` |
| `MEDIATOR` | `Proof mediator 9` | `GAO6L5BK3ZPQ54PYFBCD43R5CT2G3UW375CGHJSUJMTKHZ6CK2CXRPZI` |
| `LANDLORD` | `Proof landlord 10` | `GBV3CFBB3GXB7SOYGVIEFT2GEKJ75EBDOZECN46B3BITEVCOKX3ZKVOA` |
| `TENANT` | `Proof tenant 11` | `GBERIBK3JUL4LFDQGFLSRTPNLA6PA35CQ7EMNIZSD6HH6AQBB6VS5ZOZ` |
| `MEDIATOR` | `Proof mediator 12` | `GCLTB6F3VTZNQM4JPINUV5CV55YMTJ4SHXIUFMAGMW6S4BZPTGNVZ3DE` |

## Local Setup

Requirements:

- Node.js 24+
- npm 11+
- Rust + Cargo
- Stellar CLI
- Freighter or Rabet installed in the browser for local wallet testing

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```bash
DATABASE_URL="postgresql://username:password@your-neon-endpoint-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXT_PUBLIC_STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
NEXT_PUBLIC_STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"
NEXT_PUBLIC_STELLAR_FRIENDBOT_URL="https://friendbot.stellar.org"
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
NEXT_PUBLIC_STELLAR_CONTRACT_WASM_HASH="8ee4b8a385e881101f3e65074043a9b5e6e06fe5b962a30338181b8f7ebe4b8e"
```

Run locally:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Useful Scripts

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run db:check
npm run stellar:build
npm run stellar:install-code
npm run stellar:onchain:test
npm run submission:populate
```

## Deployment Notes

- Railway configuration is stored in [`railway.toml`](railway.toml)
- Production healthcheck route: `/api/health`
- Standalone static asset preparation is handled in [`scripts/prepare-standalone.mjs`](scripts/prepare-standalone.mjs)
- Standalone start wrapper is handled in [`scripts/start-standalone.mjs`](scripts/start-standalone.mjs)

## Submission Notes

- Replace the live demo placeholder with your final Railway public URL before submission.
- Replace the demo video placeholder with your Loom or YouTube demo link before submission.
- The README, screenshots, workflow file, and `docs/submission-proof.json` form the Level 5 documentation package for this repo.
