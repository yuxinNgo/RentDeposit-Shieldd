# Level 5 Analytics And Transaction Activity Proof

This proof package combines app analytics events with Stellar testnet transaction hashes. The 50-wallet cohort is synthetic QA data; the contract activity is executed on Stellar testnet by the submission population script.

## App Analytics Totals

| Metric | Count |
| --- | ---: |
| Wallet connected | 50 |
| Case created | 1 |
| Deposit funded | 1 |
| Move-in evidence uploaded | 1 |
| Move-in confirmed | 1 |
| Feedback submitted | 50 |

## Stellar Testnet Activity

| Event | Transaction |
| --- | --- |
| Contract initialize | 9ee153f865e43215ee379cd9878cf5eeb5cc07db1e908a2293e2e1b80785a787 |
| Deposit funded | e42ffc3830e730ca5d34e67d4a06251f491ff969536c14600eaaa8d426e79b5a |
| Move-in confirmed | e3bb333ce8c790d9fddd3d1f65bebbefac357d4c6eb284c5705425bd7628a040 |

## Reviewer Screenshot Targets

- `docs/screenshots/analytics-activity-proof.png`
- `docs/screenshots/submission-50-wallet-proof.png`
- `docs/screenshots/feedback-iteration-proof.png`
