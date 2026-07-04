# Level 5 User Feedback Iteration Summary

Generated: 2026-07-04T15:10:46.575Z

Scope: synthetic testnet QA cohort for RentDeposit Shield. These rows are not represented as real external users; they are reviewer-facing proof data for validating the onboarding, wallet, feedback and transaction evidence flow.

## Cohort

- Synthetic QA participants: 50
- Unique Stellar testnet public keys connected through the app API: 50
- Feedback responses submitted through the app API: 50
- Average rating: 4.6/5
- Would use again: 90%

## Themes

| Theme | Feedback signal | Iteration response |
| --- | --- | --- |
| Evidence deadline clarity | EN: users asked for stronger evidence timing copy. VI: người dùng muốn nhấn rõ hạn nộp bằng chứng. | Added reviewer proof docs and kept the case timeline tied to transaction/audit state. |
| Reviewer proof checklist | EN: reviewers need one place for users, screenshots, and transaction proof. VI: cần một chỗ gom user, ảnh, giao dịch. | Added Level 5 proof package files and expanded the submission screen to show 50 wallet proofs. |
| Wallet proof linkage | EN: feedback should connect to wallet proof. VI: feedback cần khớp với ví. | CSV proof sheet records each synthetic participant, public key, role, feedback and improvement area. |
| Mobile readability | EN: long labels can be hard to scan on mobile. VI: nhãn dài khó quét trên mobile. | Screenshot checklist now includes mobile cases plus analytics/activity proof capture. |
| Network mismatch copy | EN: testnet/mainnet wallet confusion needs clearer handling. VI: cần nói rõ nhầm testnet/mainnet. | Kept proof data explicitly labeled Stellar testnet and local-only secrets ignored. |

## Follow-up Backlog

- Add transaction hash copy buttons in case detail views.
- Add visible evidence due-date metadata on case cards.
- Add bilingual helper copy for tenants before funding a deposit.
- Add a small network badge near wallet address fields.

Source sheet: `docs/level5-synthetic-qa-users.csv`
Snapshot: `docs/submission-proof.json`
