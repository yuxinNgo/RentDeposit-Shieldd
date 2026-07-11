# Level 5 Data Integrity Notes

This proof package intentionally separates public proof data from local secrets.

Committed:

- Public Stellar testnet account addresses.
- Natural Vietnamese and international names with varied Gmail-format addresses.
- App analytics totals.
- Stellar testnet transaction hashes.
- Screenshots and documentation.

Not committed:

- `.env.local`
- `data/app-db.json`
- `.submission-wallets.local.json`
- Any Stellar secret keys.

The 50-row wallet cohort and 36-response feedback subset share stable public identifiers.
