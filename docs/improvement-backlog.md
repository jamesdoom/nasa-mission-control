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

Reviewed 2026-08-25. Scores follow `continuous-improvement.md`; they are starting hypotheses for the first post-launch monthly review, not promises.

| Priority | Candidate                                    | Production or usability evidence                                                                                             | Score | Owner                         | Next measurable action                                                                                                  |
| -------: | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----: | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
|        1 | Make stale fallback visible in the client UI | HTTP metadata is honest, but current client models do not surface `x-data-status` beside every instrument                    |   3.0 | Product + accessibility owner | Prototype one APOD stale banner and test comprehension with 3 participants, including keyboard/screen-reader use        |
|        2 | Validate learning-track effectiveness        | Phase 4 has maintainer acceptance and a repeat-session protocol, but no multi-participant learning outcome has been measured |   2.7 | Education/content owner       | Run 3 de-identified two-session studies and record aggregate check accuracy plus concept-language confusion             |
|        3 | Recheck first-visit terminology              | Phase 1 improved live/latest/curated/calculated explanations; no post-launch participant evidence exists                     |   2.0 | Product owner                 | Run the structured first-visit task with 5 new participants and count terminology corrections/backtracks                |
|        4 | Review complete operating trends             | Reliability and asset histories are durable, but neither has accumulated a full 30-day window                                |   1.8 | Maintainer                    | Review the first complete reliability, route-performance, and asset window before changing thresholds or adding a Drain |
|        5 | Guard recovered JavaScript headroom          | Phase 5 reduced total JavaScript from 188.7 to 178.4 kB gzip and tightened the ceiling to 184 kB                             |   1.7 | Frontend owner                | Investigate dependency and route growth before the rolling build trend exceeds 181 kB                                   |
|        6 | Refresh contract fixtures                    | Every upstream has a sanitized fixture and required-field drift mutation                                                     |   1.5 | API owner                     | Recheck official contracts quarterly and recapture only when the documented or observed shape changes                   |

New requests enter below this table only after they include an evidence link, affected user goal, acceptance criterion, owner, and score. Monthly reviews may reorder or reject items and must record why.

Accessibility blockers, data-integrity defects, privacy regressions, and repeated comprehension failures take precedence over cosmetic requests regardless of numeric score. Phase 4 research procedures and the empty aggregate evidence register are documented in `learning-accessibility-research-phase-4.md`.
