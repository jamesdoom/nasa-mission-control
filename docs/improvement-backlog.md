# Evidence-driven improvement backlog

The content-improvement baseline is recorded in [content-inventory-phase-1.md](content-inventory-phase-1.md). The machine-checked editorial queue, owners, review dates, evidence inputs, scores, and targets live in [editorial-maintenance.json](editorial-maintenance.json); product categories and features remain unchanged.

## Editorial queue

Reviewed and scored 2026-08-26. The score is `(traffic + usability evidence + content risk) / effort`; accessibility and scientific-integrity blockers override it. Every monthly review and release must update the evidence inputs and score, even when the resulting order does not change.

| Priority | Existing-content action                                       | Score | Owner                     | Evidence basis                                      |
| -------: | ------------------------------------------------------------- | ----: | ------------------------- | --------------------------------------------------- |
|        1 | Reverify time-sensitive mission and live-data wording         |   4.0 | Science editor            | High traffic and the greatest freshness risk        |
|        2 | Add reviewed questions within the four existing trivia topics |   3.5 | Learning-content reviewer | High traffic and explicit replayability request     |
|        3 | Recheck Guided Discovery after destination-copy changes       |   3.0 | Content reviewer          | Instructions can drift from the pages they describe |
|        4 | Review scale values and reference-frame explanations          |   2.5 | Science editor            | Scientific risk with lower current evidence         |

Traffic is a coarse 1–3 tier until privacy-conscious route evidence is available; it must not be presented as measured analytics. Usability evidence is likewise scored only from documented reports or structured sessions. The JSON audit recalculates the scores and rejects stale arithmetic or a backlog scored before the latest review.

## Product and operating queue

Reviewed and re-scored 2026-08-26 after the Phase 5 release review. Scores follow `continuous-improvement.md`; they are evidence-weighted priorities, not promises. The machine-checked values and owners live in `improvement-cycle.json`.

| Priority | Candidate                                            | Production or usability evidence                                                                                          | Score | Owner                    | Next measurable action                                                                                |
| -------: | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----: | ------------------------ | ----------------------------------------------------------------------------------------------------- |
|        1 | Recover compressed JavaScript headroom               | Phase 4 passes the 184 kB aggregate ceiling with no rounded headroom; another shared-code increase can fail release gates |   4.5 | Frontend maintainer      | Move shared editorial payloads out of JavaScript before adding interface code                         |
|        2 | Run assistive-technology and comprehension sessions  | Technical journeys pass, but participant and manual screen-reader counts remain zero                                      |   4.0 | Accessibility maintainer | Run three de-identified sessions covering first visit, learning, stale data, and a screen reader      |
|        3 | Review the first complete operating window           | Reliability, route-performance, asset, and visual evidence has not accumulated a representative 30-day window             |   3.5 | Reliability maintainer   | Review 30 days of route, cache, stale, latency, asset, and visual evidence before changing thresholds |
|        4 | Refresh NASA contract and scheduled content evidence | Current contract mutations and editorial audits pass, but upstream contracts and time-sensitive content continue changing |   2.3 | API and content owners   | Recheck official contracts and scheduled content reviews without weakening validation                 |

New requests enter below this table only after they include an evidence link, affected user goal, acceptance criterion, owner, and score. Monthly reviews may reorder or reject items and must record why.

Accessibility blockers, data-integrity defects, privacy regressions, and repeated comprehension failures take precedence over cosmetic requests regardless of numeric score. Phase 4 research procedures remain in `learning-accessibility-research-phase-4.md`; the current owned register and zero-session limitations are in `improvement-cycle.json`.
