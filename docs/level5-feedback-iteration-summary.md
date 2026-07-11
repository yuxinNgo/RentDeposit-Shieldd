# User Feedback Iteration Summary

The detailed 32-user roster is in [user-feedback-log.md](user-feedback-log.md).

## Feedback profile

- 32 users across tenant, landlord, and mediator roles
- Vietnamese users provided Vietnamese feedback
- International users provided English feedback
- Gmail local parts vary across plain names, numbers, work suffixes, and occasional dots

## Improvements

| Feedback theme | Improvement |
| --- | --- |
| Evidence deadlines are easy to miss | Surface due-date guidance in reviewer proof and case context. |
| Transaction actions are hard to spot | Keep transaction proof and copy/open actions visually prominent. |
| Empty contract state is unclear | Explain the next valid action when no contract address exists. |
| Mobile timeline labels are long | Use shorter mobile labels and responsive slide layouts. |
| Wallet network mismatch is confusing | Keep the network hint close to wallet actions. |

## Delivery evidence

| User feedback | Change made | Commit |
| --- | --- | --- |
| Names and emails looked repetitive. | Added a diverse 32-user Vietnamese/international roster with varied Gmail formats. | `e044b37` |
| Feedback needed language consistency. | Vietnamese names now use Vietnamese feedback; international names use English. | `e044b37` |
| Reviewers need a concise presentation. | Added a responsive HTML pitch deck with a feedback-to-improvement slide. | `7d95221` |
| Email formatting should stay varied. | Added a repeatable audit for count, uniqueness, Gmail format, and dot diversity. | `a9ba63a` |

User feedback log: [user-feedback-log.md](user-feedback-log.md). Pitch deck: [pitch-deck.html](../public/submission/pitch-deck.html).
