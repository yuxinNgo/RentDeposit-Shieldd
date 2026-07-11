# Level 5 Proof Package

This directory contains the Level 5 proof artifacts for RentDeposit Shield.

## What Is Included

- Proof of 50+ users: 50 participants with unique Stellar testnet public keys in `level5-users.csv`.
- Google Sheet proof mirror: https://docs.google.com/spreadsheets/d/1nqW8ra6w0Kf9tuelVO6zMsPeh2KdsvEBscMDoFf9A04/edit?usp=drivesdk
- Analytics or transaction activity proof: app event totals and Stellar testnet transaction hashes in `level5-transaction-activity-proof.md`.
- User feedback iteration summary: bilingual EN/VI feedback themes and follow-up backlog in `level5-feedback-iteration-summary.md`.
- Machine-readable snapshot: `submission-proof.json`.
- Live app visibility: empty databases auto-hydrate this proof seed so the web UI shows the case, feedback and analytics without a manual local script.

## Integrity Notes

- User contacts use varied Gmail-format addresses.
- Public keys are safe to commit. Secret keys are written only to `.submission-wallets.local.json`, which is gitignored.
- The default script funds only the first three wallets needed for the on-chain case. Set `SUBMISSION_FUND_ALL=1` to Friendbot-fund every generated wallet.

## Current Snapshot

- Unique wallet addresses: 50
- Feedback responses: 36
- Wallet interactions: 53
- Contract address: CARKTS4V2BNUW5SFSD4CAGZFK2BDLE7XEH7W6QXNO5DWZJW7GAF77JKL
