# Continuous improvement operating model

## Accountable intake

Public product feedback and accessibility reports enter through separate structured GitHub forms. Reports are public and explicitly warn against personal information or browser-local Flight Log content. The repository owner is accountable for triage.

Triage targets during active maintenance:

- acknowledge task-blocking accessibility reports within 5 business days;
- classify new reports at the next weekly maintenance pass;
- link duplicates to one canonical issue;
- record route, user goal, evidence, severity, owner, and acceptance criteria before scheduling work;
- close with the release version and verification evidence, or explain why the report is not being acted on.

These are maintenance targets, not a support contract or guaranteed response time.

## Monthly evidence review

The `Monthly product review` workflow opens one issue on the third day of each month and assigns the repository owner. The owner links evidence and completes all five domains:

| Domain           | Evidence                                                                                      | Decision owner                                | Required output                                             |
| ---------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------- |
| Reliability      | Rolling 30-day artifact, smoke runs, incidents, upstream/error categories, cache/stale ratios | Maintainer                                    | Trend, incident actions, threshold changes                  |
| Performance      | Desktop/mobile artifact, asset budgets, route regressions                                     | Maintainer                                    | Budget decision and targeted issue                          |
| Accessibility    | Axe suite, keyboard/screen-reader/reflow session, public reports                              | Maintainer                                    | Barrier severity and verified remediation plan              |
| Content accuracy | Mission review artifact, source changes, learning claims                                      | Content reviewer (maintainer until delegated) | Corrected facts, review dates, or explicit no-change record |
| User feedback    | Structured issues and usability-session notes                                                 | Product owner (repository owner)              | Themes, rejected assumptions, prioritized candidates        |

Update `public-status.md`, limitations, privacy, and accessibility status whenever the evidence changes their claims. Close the review issue only after updating `improvement-backlog.md` or recording that evidence did not justify reprioritization.

## Structured usability session

Recruit 3–5 participants who have not recently used the tested journey. Do not collect names, recordings, account identifiers, or private browser data unless a separate explicit research protocol is introduced.

1. Record date, product version, viewport/input/assistive-technology context, and participant code only.
2. Ask the participant to orient on first visit, inspect one live/latest instrument, connect it to a mission or learning track, and recover from an empty/error state.
3. Observe decisions, backtracks, task completion, and volunteered language. Do not coach terminology.
4. Ask one comprehension check: identify whether a displayed value is observed, calculated, curated, current, or stale.
5. Record task-level counts and de-identified quotations only with permission.
6. Convert findings into evidence statements, not feature requests; rank them with the backlog rubric.

## Prioritization rubric

Score each candidate from 1–3 for user impact, evidence strength, and risk reduction; score effort from 1–3. Priority score is `(impact + evidence + risk reduction) / effort`. Accessibility blockers, data-integrity defects, privacy regressions, and security issues override the numeric order. Every active item needs an owner and a measurable next action.
