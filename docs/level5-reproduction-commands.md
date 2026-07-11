# Level 5 Reproduction Commands

Run from the repository root.

```bash
npm install
npm run dev
APP_BASE_URL=http://127.0.0.1:3000 npm run submission:populate
npm run lint
npm run typecheck
npm run test
npm run build
```

The population script creates:

- 50 synthetic Stellar testnet public keys.
- 36 API-submitted feedback records.
- 1 Stellar testnet escrow contract case.
- Local proof files under `docs/`.

Secret keys are written only to `.submission-wallets.local.json`, which is ignored by git.

The deployed app also hydrates the committed Level 5 proof seed automatically when the database state is empty.
