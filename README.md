# RentDeposit Shield

Rental deposit protection infrastructure powered by Stellar + Soroban.

## Problem

Rental deposit disputes usually break down into screenshots, off-platform transfers, no shared evidence timeline and no neutral release workflow.

## Solution

RentDeposit Shield is a production-style MVP that keeps the escrow case lifecycle in one Next.js app:

- landlord creates a case
- tenant funds the deposit
- both sides upload move-in and move-out evidence
- landlord approves refund or proposes a deduction
- tenant accepts or opens a dispute
- mediator resolves the split
- analytics, monitoring, wallet proof and feedback stay visible in-product

## Why Stellar

- Stellar testnet is fast and cheap for demo settlement flows
- Soroban is a strong fit for escrow state transitions and role-based release logic
- transaction hashes and contract addresses are easy to surface to users

## Stack

- Next.js 16 + TypeScript + App Router
- Tailwind CSS v4
- Recharts
- SWR
- Zod
- Sonner
- Soroban smart contract in Rust

## Architecture Overview

This repo intentionally keeps frontend and backend together.

- UI pages live in `src/app/*`
- route handlers live in `src/app/api/*`
- local demo persistence uses `data/app-db.json`
- domain logic lives in `src/lib/domain/*`
- server repository and summaries live in `src/lib/server/*`
- Stellar wallet and contract client wrappers live in `src/lib/stellar/*`
- Soroban contract lives in `contracts/rent_deposit_escrow`

The app is a single Next.js deployment. There is no separate backend service.

## Smart Contract Overview

Contract name: `rent_deposit_escrow`

Implemented in Rust with Soroban SDK as a role-gated escrow state machine. For testability, auth-sensitive methods accept an `actor: Address` parameter and validate it against the stored tenant, landlord or mediator address.

Implemented contract functions:

- `initialize_case`
- `fund_deposit(actor, amount)`
- `confirm_move_in(actor)`
- `request_refund(actor)`
- `approve_full_refund(actor)`
- `propose_deduction(actor, deduction_amount, reason_hash)`
- `accept_deduction(actor)`
- `open_dispute(actor, reason_hash)`
- `resolve_dispute(actor, tenant_amount, landlord_amount, resolution_hash)`
- `get_case`
- `close_case(actor)`

Contract deployment address placeholder:

- `CD7MRENTDEPOSITESCROWTESTNETPLACEHOLDER000000000000`

## Features

- Landing page with Stellar positioning and testnet disclaimer
- Onboarding flow with role selection and wallet connection
- Dashboard metrics and recent activity
- Cases list, search and status filter
- Create case form
- Case detail page with evidence gallery, checklist, action panel and audit timeline
- Dispute resolution workspace
- Analytics page
- Feedback collection and summary
- Submission evidence page
- Custom monitoring/error logging
- Demo seed data with 10+ wallet proof interactions
- Reset API for local testing

## Local Setup

Requirements:

- Node.js 24+
- npm 11+
- Rust + Cargo if you want to run Soroban contract tests

Install dependencies:

```bash
npm install
```

## Running the App

Start local development:

```bash
npm run dev
```

Open:

- `http://localhost:3000`

Useful routes:

- `/`
- `/onboarding`
- `/dashboard`
- `/cases`
- `/cases/new`
- `/disputes`
- `/analytics`
- `/feedback`
- `/submission`

Reset demo data:

```bash
curl -X POST http://localhost:3000/api/dev/reset
```

## Environment Variables

This local MVP does not require mandatory env vars to boot.

Optional future variables:

```bash
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_ANALYTICS_PROVIDER=
```

## Scripts

```bash
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
```

Contract tests:

```bash
cargo test --manifest-path contracts/Cargo.toml
```

## Demo Flow

1. Open `/`.
2. Go to `/onboarding`.
3. Choose `LANDLORD`.
4. Connect a wallet or use the mock fallback.
5. Create a new case at `/cases/new`.
6. Switch role to `TENANT`.
7. Open the created case and fund the deposit.
8. Upload move-in evidence and confirm move-in.
9. Upload move-out evidence and request refund.
10. Switch back to `LANDLORD` and propose a deduction or approve refund.
11. Switch to `TENANT` and accept or open dispute.
12. Switch to `MEDIATOR` and resolve the dispute.
13. Inspect `/analytics`, `/feedback` and `/submission`.

## Analytics and Monitoring

Tracked event families include:

- page views
- onboarding completion
- wallet connections
- case creation
- deposit funded
- refund requested
- deduction proposed and accepted
- dispute opened and resolved
- feedback submitted
- submission page viewed

Monitoring is implemented as a custom error log surfaced in the UI and populated by API, wallet and contract-path failures.

## User Validation Proof

Seed data includes:

- 10 unique wallet interaction proofs
- feedback samples
- submission summary cards

This is a collection mechanism for local/demo workflows until real user data is added.

## Screenshots Checklist

- Landing page desktop
- Dashboard overview
- Case detail timeline
- Mediator dispute panel
- Mobile responsive cases list

## Demo Video

Placeholder:

- `https://example.com/demo-video-placeholder`

## Compliance Notes

- testnet only
- no real money
- not a licensed escrow service
- not a legal contract replacement
- mainnet launch would require legal review
- fiat on/off-ramp would require licensed partners or Stellar Anchors
- evidence files may contain personal data and need privacy controls in production

## Known Limitations

- Stellar wallet integration falls back to a mock wallet when Freighter is unavailable
- contract deployment address is still a placeholder
- local persistence uses a JSON file instead of a production database
- seeded analytics and validation proof are demo data
- commit-count status is not auto-derived inside the UI yet

## Roadmap

- connect real Stellar testnet token flows
- deploy and wire the Soroban contract end to end
- add auth and multi-user persistence
- upload real files to object storage
- add Sentry or another hosted monitoring backend
- publish a live demo deployment
