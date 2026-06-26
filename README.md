# RentDeposit Shield

Rental deposit workflow MVP built as a single Next.js app with real Stellar testnet wallet signing and Soroban contract interactions.

## What it does

- landlord connects Freighter or Rabet
- landlord creates a case, which deploys a fresh Soroban contract instance
- tenant funds the case on-chain
- tenant / landlord confirm move-in, request refund, propose deductions, open disputes
- mediator resolves the dispute on-chain
- the app syncs tx hashes and resulting statuses into its Neon-backed audit workspace

There is no separate backend service. UI, API routes, Neon persistence, wallet integration and contract orchestration all live in this repo.

## Stack

- Next.js 16 + App Router + TypeScript
- Tailwind CSS v4
- SWR
- Zod
- Sonner
- Recharts
- Stellar Wallets Kit
- `@stellar/stellar-sdk`
- Soroban contract in Rust

## Soroban contract

Contract path:

- `contracts/rent_deposit_escrow`

Current build hash:

- `8ee4b8a385e881101f3e65074043a9b5e6e06fe5b962a30338181b8f7ebe4b8e`

The contract stores the case state machine on-chain and enforces actor auth with `require_auth()`.

Implemented methods:

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

## Wallet support

The app supports only:

- Freighter
- Rabet

There is no mock wallet fallback anymore.

## Local setup

Requirements:

- Node.js 24+
- npm 11+
- Rust + Cargo
- Stellar CLI (`stellar`)
- Freighter or Rabet installed in the browser you will test with

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Open:

- `http://localhost:3000`

## Testnet prep

1. Switch Freighter or Rabet to Stellar Testnet.
2. Fund the wallets you want to use with Friendbot.
3. Use one landlord wallet, one tenant wallet and one mediator wallet for the full flow.

Friendbot:

- `https://friendbot.stellar.org`

## Scripts

App quality:

```bash
npm run typecheck
npm run test
npm run build
```

Contract quality:

```bash
cargo test --manifest-path contracts/Cargo.toml
npm run stellar:build
```

Install contract code on testnet:

```bash
npm run stellar:install-code
```

Optional: write the installed hash into `.env.local`:

```bash
npm run stellar:install-code -- --write-env
```

Run the real on-chain end-to-end flow:

```bash
npm run stellar:onchain:test
```

That script:

- builds the contract
- funds fresh testnet accounts through Friendbot
- uploads the Wasm to testnet
- deploys a fresh contract instance
- runs `initialize_case -> fund_deposit -> confirm_move_in -> request_refund -> propose_deduction -> open_dispute -> resolve_dispute`

## Environment

The app has working defaults for Stellar testnet, but you can override them in `.env.local`.

See [.env.example](.env.example).

## Database

Server-side app state now persists in Neon Postgres through `DATABASE_URL`.

Set this in `.env.local`:

```bash
DATABASE_URL="postgresql://username:password@your-neon-endpoint-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

Quick connectivity check:

```bash
npm run db:check
```

The workspace starts empty by default. No seeded demo wallets or fake cases are injected.

Reset the Neon-backed workspace:

```bash
curl -X POST http://localhost:3000/api/dev/reset
```

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

## Current behavior

- wallet connect is real
- contract deployment is real
- Soroban method calls are real
- tx hashes shown in the app come from successful testnet transactions
- Next.js API routes only sync app state after on-chain execution succeeds

## Known limitations

- the contract currently models escrow state transitions, not live token custody
- evidence uploads are local metadata only
- persistence currently uses a single JSONB application-state row in Neon to keep the existing domain engine intact
- the submission page still depends on actions you perform locally to accumulate proof data
- multi-user concurrency is not implemented beyond wallet switching in the same app

## Repo

- `https://github.com/yuxinNgo/RentDeposit-Shieldd`
