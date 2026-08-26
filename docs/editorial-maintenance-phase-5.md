# Editorial maintenance and continuous improvement — phase 5

Reviewed 2026-08-26. This phase maintains the existing content set; it adds no user-facing category or feature.

## Monthly review and accountability

The scheduled `Monthly product review` runs on the third day of each month. Before assigning the repository owner one review issue, it produces and retains a private `editorial-health` JSON artifact. The content reviewer coordinates the review; the area owners in `editorial-maintenance.json` decide factual corrections and sign off on their areas. Until those roles are delegated, the repository maintainer is accountable.

The review closes only after the owner:

1. triages every failure and warning in the artifact;
2. reads time-sensitive sources rather than treating link availability as fact verification;
3. updates verified dates only for records actually checked;
4. records meaningful corrections in `CHANGELOG.md`;
5. updates the next review date and re-scores the editorial backlog using available route traffic, structured usability findings, content risk, and effort;
6. links corrective issues or records an explicit no-change decision.

Releases run the same structural audit. A backlog dated before its latest review fails the gate, making re-scoring part of review and release preparation rather than an optional follow-up.

## Automatic evidence and escalation

`npm run review:content` checks the inventory, required citations, review freshness, exact normalized trivia duplicates, readability bounds, topic coverage, backlog arithmetic, and the test suite. `npm run review:content:links` adds a live check of the 61 unique official source URLs and writes the retained report.

- Missing citations, duplicate trivia, overdue verification/review dates, target regressions, and definite `404`/`410` source responses are actionable failures.
- Timeouts, rate limits, and upstream `5xx` responses are warnings. A reviewer must retry and inspect them because transient availability is not evidence that a citation is invalid.
- A successful link check proves reachability only. Scientific accuracy and source support still require human reading.

## Current targets

| Measure            | Target                                                                                  | Current baseline |
| ------------------ | --------------------------------------------------------------------------------------- | ---------------- |
| Trivia coverage    | At least 96 total and 24 in each of the four existing topics                            | 96; 24 each      |
| Reading clarity    | Every trivia prompt at most 20 words; every explanation 8–55 words                      | 100%             |
| Citation health    | 100% of trivia records cited and dated; minimum source coverage for all curated areas   | 100%; 61 URLs    |
| Content freshness  | Monthly review within 40 days; stories 120 days; trivia and learning content 210 days   | Current          |
| Backlog discipline | Re-score after every monthly review and release; every item has evidence, owner, effort | Current          |

These are floors, not claims that more words or more questions are automatically better. The next cycle first addresses freshness or integrity failures, then uses documented traffic and usability evidence to select improvements within the existing content areas.
