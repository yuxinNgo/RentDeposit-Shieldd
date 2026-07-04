# Level 5 Data Integrity Notes

This proof package intentionally separates public proof data from local secrets.

Committed:

- Public Stellar testnet account addresses.
- Synthetic QA names and `.test` email addresses.
- App analytics totals.
- Stellar testnet transaction hashes.
- Screenshots and documentation.

Not committed:

- `.env.local`
- `data/app-db.json`
- `.submission-wallets.local.json`
- Any Stellar secret keys.

The 50-row cohort is labeled synthetic QA data and should not be represented as real external users.

