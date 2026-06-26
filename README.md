# RentDeposit Shield

Rental deposit workflow MVP built as a single Next.js app with real Stellar testnet wallet signing, Soroban contract execution, and Neon-backed persistence. There is no separate backend service: UI, API routes, database access, wallet integration, analytics, monitoring, and contract orchestration all live in this repo.

## Submission checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Public GitHub repository | Ready | `https://github.com/yuxinNgo/RentDeposit-Shieldd` |
| README with complete documentation | Ready | This file |
| 15+ meaningful commits | Ready after this docs update is committed | `/submission` page reads git history directly |
| Live demo link | Owner will add before final submission | Intentionally omitted here |
| Contract deployment address | Ready | `CDQWMOTD2S6KW6LVNJEUVJBTHXTQMUJLM4NPGEGMME7ZRWWLKEIFDKYW` |
| Product UI screenshots | Ready | `docs/screenshots/dashboard-desktop.png` |
| Mobile responsive screenshots | Ready | `docs/screenshots/cases-mobile.png` |
| Analytics or monitoring screenshot | Ready | `docs/screenshots/analytics-desktop.png` |
| Demo video link | Owner will add before final submission | Intentionally omitted here |
| Proof of 10+ user wallet interactions | Ready | `docs/submission-proof.json` |
| Basic user feedback summary | Ready | `docs/submission-proof.json` and section below |

## What the product does

- Landlord connects a real Freighter or Rabet wallet.
- Landlord creates a deposit case from the Next.js UI.
- The app deploys a fresh Soroban contract instance for that case.
- Tenant funds the deposit on Stellar testnet.
- Tenant uploads move-in evidence and confirms move-in on-chain.
- The app syncs tx hashes, case status, analytics events, and audit logs into Neon.
- Role-specific menus change by connected role: landlord, tenant, or mediator.

## Tech stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- SWR
- Zod
- Recharts
- `@creit.tech/stellar-wallets-kit`
- `@stellar/stellar-sdk`
- Neon Postgres
- Soroban smart contract in Rust

## Wallet support

Only real Stellar browser wallets are supported in the UI:

- Freighter
- Rabet

Mock wallets were removed. The proof dataset in this repo was generated with real Stellar testnet accounts and real on-chain transactions.

## Real on-chain submission proof

The submission artifacts were generated against Stellar testnet and stored in [`docs/submission-proof.json`](docs/submission-proof.json).

### Current proof snapshot

- Contract deployment address: `CDQWMOTD2S6KW6LVNJEUVJBTHXTQMUJLM4NPGEGMME7ZRWWLKEIFDKYW`
- Case id: `case_e68de6cca91a`
- Unique wallet addresses recorded: `12`
- Total wallet interactions recorded: `15`
- Total onboarded users: `12`
- Feedback responses collected: `8`
- Average feedback rating: `4.6 / 5`
- Would use again: `100%`

### Recorded on-chain/app actions

- `12` wallet connections
- `1` case creation
- `1` deposit funding transaction
- `1` move-in evidence upload
- `1` move-in confirmation transaction
- `8` feedback submissions

### User wallet addresses

These are public Stellar testnet wallet addresses used in the submission proof run.

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

### Proof files

- [`docs/submission-proof.json`](docs/submission-proof.json): public wallet addresses, tx hashes, analytics totals, feedback summary, and case metadata
- `docs/screenshots/`: committed screenshots for UI, mobile, analytics, and submission proof screens
- `.submission-wallets.local.json`: local-only secret dump for optional manual Freighter import during local testing. This file is gitignored and never committed.

## Basic user feedback summary

Feedback was collected from `8` real testnet-wallet participants after the end-to-end flow.

- Average score: `4.6 / 5`
- Reuse intent: `100%`
- Positive themes: wallet connection, audit trail visibility, role-based flow clarity
- Main confusion themes: evidence timing, who closes the case after settlement, a few places where copy needs to be clearer

## Analytics and monitoring setup

The app includes a built-in analytics and monitoring surface at `/analytics` and `/submission`.

- Product analytics are derived from persisted app events such as `wallet_connected`, `case_created`, `deposit_funded`, `move_in_confirmed`, and `feedback_submitted`.
- Monitoring is derived from persisted error logs split by scope: `wallet`, `contract`, `api`, and `ui`.
- Current proof snapshot health is `healthy` with `0` recorded errors.

## Screenshots

### Product UI

![Dashboard desktop](docs/screenshots/dashboard-desktop.png)

### Mobile responsive design

![Cases mobile responsive](docs/screenshots/cases-mobile.png)

### Analytics and monitoring

![Analytics and monitoring](docs/screenshots/analytics-desktop.png)

## Soroban contract

Contract path:

- `contracts/rent_deposit_escrow`

Current Wasm hash used by the app:

- `8ee4b8a385e881101f3e65074043a9b5e6e06fe5b962a30338181b8f7ebe4b8e`

Main methods:

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

## Local setup

Requirements:

- Node.js 24+
- npm 11+
- Rust + Cargo
- Stellar CLI
- Freighter or Rabet installed in the browser you will test with

Install dependencies:

```bash
npm install
```

Set environment values in `.env.local`:

```bash
DATABASE_URL="postgresql://username:password@your-neon-endpoint-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXT_PUBLIC_STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
NEXT_PUBLIC_STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
```

Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deploy on Railway

This repo is prepared for Railway deployment.

- `next.config.ts` uses `output: "standalone"` for self-hosted Next.js builds.
- `npm run start` serves the standalone server.
- `railway.toml` defines the build command, start command, restart policy, and a healthcheck path at `/api/health`.

### Railway steps

1. Create a new Railway project.
2. Deploy this GitHub repository as a service.
3. In the service variables, add:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_STELLAR_RPC_URL`
   - `NEXT_PUBLIC_STELLAR_HORIZON_URL`
   - `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE`
   - `NEXT_PUBLIC_STELLAR_CONTRACT_WASM_HASH`
4. Generate a public Railway domain from the service Networking tab.

### Database options

- If you want to keep the current setup, paste your existing Neon `DATABASE_URL`.
- If you want the database inside Railway, add a PostgreSQL service and create a reference variable for `DATABASE_URL` in the app service.

### Notes

- Railway injects `PORT` automatically; the standalone Next.js server uses it at runtime.
- The healthcheck route verifies both app boot and database connectivity before Railway marks a deploy healthy.

## Useful scripts

Quality checks:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Database check:

```bash
npm run db:check
```

Contract build:

```bash
npm run stellar:build
```

Install contract code on Stellar testnet:

```bash
npm run stellar:install-code
```

Run the real on-chain end-to-end contract test:

```bash
npm run stellar:onchain:test
```

Populate the submission package with real Stellar testnet wallets and app data:

```bash
npm run submission:populate
```

That script:

- resets the Neon-backed workspace
- generates fresh Stellar testnet accounts
- connects them through the project API
- deploys a real contract from the app flow
- funds and confirms the case on-chain
- writes `docs/submission-proof.json`
- writes `.submission-wallets.local.json` locally for optional manual wallet import

## Main routes

- `/`
- `/onboarding`
- `/dashboard`
- `/cases`
- `/cases/new`
- `/disputes`
- `/analytics`
- `/feedback`
- `/submission`

## Current limitations

- The contract currently enforces the escrow state machine, but does not model production-grade token custody.
- Evidence uploads are metadata-backed and not pinned to decentralized storage yet.
- Persistence uses a single JSONB app-state row in Neon to keep the domain engine simple.
- Live demo link and demo video link are intentionally left for the repo owner to attach before final submission.
