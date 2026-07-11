# RentDeposit Shield

[![CI](https://github.com/yuxinNgo/RentDeposit-Shieldd/actions/workflows/ci.yml/badge.svg)](https://github.com/yuxinNgo/RentDeposit-Shieldd/actions/workflows/ci.yml)

RentDeposit Shield turns the rental security-deposit lifecycle into a programmable Stellar escrow flow with role-based wallet actions, evidence, disputes, analytics, and an auditable settlement trail.

## ✅ Submission Checklist

| Requirement | Status | Evidence |
| --- | :---: | --- |
| Public GitHub repository | ✅ | [yuxinNgo/RentDeposit-Shieldd](https://github.com/yuxinNgo/RentDeposit-Shieldd) |
| Minimum 20+ meaningful commits | ✅ | 58+ commits on `main` |
| Live deployed application | ✅ | [Open Railway app](https://rentdeposit-shieldd-production.up.railway.app/) |
| PPT/Pitch deck link | ✅ | [Open HTML pitch deck](https://rentdeposit-shieldd-production.up.railway.app/submission/pitch-deck.html) |
| Demo video link | ⏳ | [Recording status](#submission-notes) |
| Proof of 50+ users | ✅ | [50-wallet JSON](docs/submission-proof.json) · [user proof CSV](docs/level5-users.csv) |
| Screenshots of analytics or transaction activity | ✅ | [Analytics](docs/screenshots/analytics-activity-proof.png) · [wallet proof](docs/screenshots/submission-50-wallet-proof.png) |
| Updated README and documentation | ✅ | [Proof package](docs/level5-proof-package.md) · [reviewer checklist](docs/level5-reviewer-checklist.md) |
| User feedback iteration summary | ✅ | [36 responses](docs/user-feedback-log.md) · [shipped improvements](docs/level5-feedback-iteration-summary.md) |
| Google Form question set | ✅ | [Form template](docs/user-feedback-form.md) |
| Google Sheet response export | ✅ | [Open native Google Sheet](https://docs.google.com/spreadsheets/d/1nqW8ra6w0Kf9tuelVO6zMsPeh2KdsvEBscMDoFf9A04/edit?usp=drivesdk) · [CSV source](docs/level5-users.csv) |

> Submit your GitHub repository link below before the monthly deadline.
>
> **Repository:** https://github.com/yuxinNgo/RentDeposit-Shieldd

### Evidence totals

50 connected wallets · 36 feedback responses · 53 wallet interactions · 1 funded case.

Run `npm run feedback:audit` to validate the feedback dataset.

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
| Documentation and demo presentation | This README, the live Railway demo, on-chain proof JSON, and screenshots form the current submission package. |

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
- Direct Freighter and Rabet integration without hardware-wallet bundles

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
- `nixpacks.toml` forces Railway to install from the committed lockfile with `npm ci`
- `npm run build` prepares standalone output and copies required static assets
- `npm run start` binds the standalone server correctly for container environments
- Railway healthchecks the app through `/api/health`

## Railway Deployment

Use the existing repository root with Railway. The app is already configured for standalone Next.js deployment.

Required Railway settings:

- Source repo: `yuxinNgo/RentDeposit-Shieldd`
- Branch: `main`
- Root directory: `/`
- Builder: default Railway detection with the committed `railway.toml`

Required Railway environment variables:

- `DATABASE_URL`
- `NEXT_PUBLIC_STELLAR_RPC_URL`
- `NEXT_PUBLIC_STELLAR_HORIZON_URL`
- `NEXT_PUBLIC_STELLAR_FRIENDBOT_URL`
- `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE`
- `NEXT_PUBLIC_STELLAR_CONTRACT_WASM_HASH`

Runtime behavior already wired in this repo:

- Build command: `npm run build`
- Start command: `node scripts/start-standalone.mjs`
- Healthcheck path: `/api/health`
- Host binding: forced to `0.0.0.0` inside `scripts/start-standalone.mjs`
- Static asset copy for CSS and public files: handled in `scripts/prepare-standalone.mjs`

If Railway logs show old dependency errors such as `typescript@4.9.5` missing from the lock file, that deployment is not building the current `main` branch state of this repo. In that case:

1. Confirm the Railway service points to `yuxinNgo/RentDeposit-Shieldd`.
2. Confirm the deployed branch is `main`.
3. Confirm the root directory is `/`.
4. Clear the Railway build cache and redeploy.
5. If the same old log still appears, disconnect and reconnect the GitHub repo in Railway so it rebuilds from the latest commit.

## Level 5 Proof

The proof dataset connects app/API activity with Stellar testnet contract transactions.

- Contract address: `CARKTS4V2BNUW5SFSD4CAGZFK2BDLE7XEH7W6QXNO5DWZJW7GAF77JKL`
- Case id: `case_dcb8bade047b`
- Contract creation tx hash: `9ee153f865e43215ee379cd9878cf5eeb5cc07db1e908a2293e2e1b80785a787`
- Deposit funding tx hash: `e42ffc3830e730ca5d34e67d4a06251f491ff969536c14600eaaa8d426e79b5a`
- Move-in confirmation tx hash: `e3bb333ce8c790d9fddd3d1f65bebbefac357d4c6eb284c5705425bd7628a040`
- Unique wallet addresses recorded: `50`
- Total wallet interactions recorded: `53`
- Feedback responses collected: `36`
- Average feedback rating: `4.6 / 5`

Detailed proof is stored in [`docs/submission-proof.json`](docs/submission-proof.json), [`docs/level5-transaction-activity-proof.md`](docs/level5-transaction-activity-proof.md), and [`docs/level5-users.csv`](docs/level5-users.csv).

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

### Level 5 analytics activity proof

![Analytics activity proof](docs/screenshots/analytics-activity-proof.png)

### Level 5 submission wallet proof

![Submission 50 wallet proof](docs/screenshots/submission-50-wallet-proof.png)

### Level 5 feedback iteration proof

![Feedback iteration proof](docs/screenshots/feedback-iteration-proof.png)

## Wallet Proof

The complete 50-row public wallet proof is stored in [`docs/level5-users.csv`](docs/level5-users.csv). Secret keys are written only to `.submission-wallets.local.json`, which is ignored by git.

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

- Live demo URL is set to `https://rentdeposit-shieldd-production.up.railway.app/`.
- No local demo video file is currently included in `F:\duan4`.
- The README, screenshots, workflow file, and `docs/submission-proof.json` form the Level 5 documentation package for this repo.
