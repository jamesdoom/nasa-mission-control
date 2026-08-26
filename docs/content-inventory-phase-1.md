# Content inventory and quality baseline — phase 1

Reviewed 2026-08-25. The repository maintainer is the accountable owner until a named editor is assigned. “Baseline complete” means the area was inventoried and screened for readability, accessibility, tone, source coverage, duplication, terminology, unfinished copy, and scientific-claim risk; it does not mean every linked fact was independently reverified during this phase.

## Ranked inventory

Priority combines visibility, educational value, and the harm caused by stale or ambiguous claims. P0 is release-blocking, P1 is the next editorial cycle, P2 is routine maintenance, and P3 is low-risk polish.

| Rank | Existing area                                          | Baseline                                                                          | Owner                     | Status            | Priority | Findings and next action                                                                                                                                                                                                    |
| ---: | ------------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------- | ----------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|    1 | Mission Archive and comparison                         | 10 profiles; reviewed dates and at least two official sources per record          | Content reviewer          | Phase 3 complete  | P2       | Every record now connects objectives, instruments, results, milestones, and continuing status. Preserve the status-review cadence; Juno’s conflicting active label and older schedule require human review.                 |
|    2 | Space Trivia                                           | 64 questions; 16 in every existing channel, with at least four at each difficulty | Learning-content reviewer | Phase 2 complete  | P2       | Every question has a teaching explanation, official NASA source, and review date. Integrity tests prevent duplicate prompts, answer bias, unreadable copy, and unstable wording.                                            |
|    3 | Live-data explanations                                 | APOD, asteroids, DONKI, EPIC, and NASA Media                                      | Science editor            | Phase 4 complete  | P2       | Every source now has consistent freshness, meaning, and limitation guidance; empty/loading copy is bounded, and explicitly stale fallbacks remain visible. Recheck this language whenever contracts or cache policy change. |
|    4 | Guided learning                                        | 3 tracks with objectives, checks, reflections, sources, and printable sessions    | Learning-content reviewer | Phase 3 complete  | P2       | Tracks now have explicit review dates, second evidence prompts, term definitions, and tailored completion synthesis. Human learning-effectiveness evidence remains a separate research question.                            |
|    5 | Scientific stories                                     | 3 collections with four chapters and four milestones each                         | Science editor            | Phase 3 complete  | P2       | Every chapter now has an evidence caption, each story closes with a bounded synthesis, and shared definitions prevent terminology drift. “Today” milestones still require scheduled review.                                 |
|    6 | Guided Discovery                                       | 9 paths joining existing instruments, media, and mission history                  | Content reviewer          | Baseline complete | P2       | Clear route-based narratives with official anchors. Recheck instructions when destination-page language changes to prevent mismatched promises.                                                                             |
|    7 | Celestial Scale Laboratory                             | 7 curated profiles and transparent light-time calculations                        | Science editor            | Baseline complete | P2       | The interface distinguishes reference frames and calculations. Add a common review-date convention in a later content pass; preserve the warning that values are not simultaneous positions.                                |
|    8 | Mission map and investigation copy                     | Existing structured mission relationships and DONKI comparisons                   | Science editor            | Baseline complete | P2       | Mostly derived from reviewed records or normalized data. Keep “related” distinct from causal and “modeled” distinct from observed.                                                                                          |
|    9 | Discovery, search, and Flight Log guidance             | Existing search descriptions, empty states, save/backup guidance                  | UX content owner          | Baseline complete | P2       | Generally plain-language and action-oriented. Recheck labels when source filters or local-storage formats change; do not imply server sync.                                                                                 |
|   10 | Dashboard and navigation copy                          | First-visit orientation, evidence onboarding, instrument summaries                | UX content owner          | Baseline complete | P2       | High visibility but lower scientific density. Continue to prefer task language and define evidence terms at first use.                                                                                                      |
|   11 | About, privacy, accessibility, status, and limitations | Public operating and governance documents plus About-page summaries               | Product owner             | Baseline complete | P2       | Current as of this review. Update in the same change whenever capabilities, integrations, storage, monitoring, or known barriers change.                                                                                    |
|   12 | Repository and contributor documentation               | README, runbooks, architecture, release and phase evidence                        | Maintainer                | Baseline complete | P2       | The audit found stale TanStack Query and Node 20 setup references; both were corrected in this phase. Phase histories should remain factual records, not current capability claims.                                         |

No `TODO`, `TBD`, `FIXME`, lorem ipsum, or “coming soon” content markers were found in user-facing source or documentation. Similar explanations occur intentionally across context-specific routes; no verbatim duplicate educational record was identified. Repeated evidence definitions should use the shared vocabulary below rather than acquire route-specific meanings.

## Quality baseline

- **Source strength:** missions, stories, and trivia carry review dates; learning tracks, guided paths, and scale profiles have official sources but need a common dated-review field or ledger.
- **Freshness risk:** active mission status, “Today” story milestones, latest-data explanations, and operational documents carry the highest change risk.
- **Readability and tone:** content generally uses direct, non-promotional language and bounds scientific claims. Long mission and story passages rely on headings, lists, tables, and progressive disclosure.
- **Accessibility:** educational visuals have adjacent structured text or tables, controls use semantic labels, and automated axe/reflow/keyboard coverage exists. Automated tests are not a screen-reader or comprehension claim.
- **Terminology:** “live,” “latest available,” “curated,” and “calculated” are established; “modeled” and “observed” also appear in analysis. The required definitions below are authoritative.
- **Scientific accuracy:** current integrity tests enforce NASA-hosted citations and structural bounds. Human review remains necessary because a valid URL does not prove that a summary is current or correctly interpreted.

## Editorial standards

### Sources and review dates

1. Use the most specific current first-party NASA mission, science, dataset, or image record available. A secondary source may provide context but cannot be the sole support for a scientific claim.
2. Place the citation beside the claim or in the record’s clearly associated source list. Link labels must identify the destination; avoid “click here.”
3. Record verification as ISO `YYYY-MM-DD` only after a human reads the supporting page. Link checks and successful API validation are availability evidence, not editorial verification.
4. Recheck active missions and time-sensitive claims at least every 90 days, extended missions every 60 days, completed historical records yearly, and public operating/privacy/accessibility claims whenever behavior changes or at the monthly review.
5. State uncertainty, approximation, reference frame, and known limitations. Do not turn absence of evidence into evidence of absence or describe correlation as causation.

### Evidence vocabulary

| Label                | Required meaning                                                                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Live**             | Requested from an active upstream during the current session. It may still describe an earlier observation and is not a guarantee of continuous telemetry.             |
| **Latest available** | The newest record returned or identified by the source, which may lag the current date. Show the source timestamp when available.                                      |
| **Observed**         | A measurement, timestamp, classification, or image reported by the source. Preserve its units and do not silently convert it into a forecast.                          |
| **Modeled**          | An estimate or analysis output produced by a stated model. Identify the model context and avoid presenting it as direct observation.                                   |
| **Calculated**       | A transparent transformation of displayed or cited inputs. Name the operation, units, assumptions, and rounding when material.                                         |
| **Curated**          | Locally maintained editorial content reviewed against cited sources on a stated date. It is neither live nor authored by NASA unless explicitly quoted and attributed. |

Use “latest available,” not “latest,” when delay is possible. Use “NASA source” for provenance and “Mission Control summary” for local editorial interpretation. Avoid “real time” unless the upstream contract defines and meets a measurable real-time interval.

### Readability, accessibility, and maintenance

- Lead with the answer or learning objective, define uncommon terms at first use, keep paragraphs focused, and expand acronyms.
- Write descriptive headings and link text; do not encode meaning only with color, position, animation, or visual charts.
- Give every visualization an equivalent table or structured text description and retain units in both forms.
- Use UTC for event timestamps unless a source requires another standard; label calendar dates that are publication or retrieval dates rather than observations.
- Prefer bounded explanations over promotional superlatives. State what the evidence cannot establish.
- Content changes must update relevant integrity tests, review dates, this inventory when scope or risk changes, the changelog, and the scored backlog after review or release.

## Phase 2 outcome

The existing trivia bank now contains 16 reviewed questions per channel, balanced across the three existing difficulties, with teaching explanations, official citations, verification dates, duplicate detection, and answer-position checks. No channel, category, route, or product feature was added. See [trivia-expansion-phase-2.md](trivia-expansion-phase-2.md) for evidence.

## Phase 3 outcome

Existing missions, science stories, and learning tracks now form a more coherent evidence journey: mission objectives connect to instruments, results, milestones, and honest status notes; story chapters carry explicit evidence captions into bounded conclusions; and learning tracks add source-dated terminology, a second reflection prompt, and a tailored synthesis. See [missions-stories-learning-phase-3.md](missions-stories-learning-phase-3.md) for the coverage and limits.

## Phase 4 outcome

APOD, NeoWs, DONKI, EPIC, and NASA Media now use a shared interpretation structure for freshness, displayed evidence, and unsupported conclusions. Loading and empty states name the actual operation, stale server fallbacks remain visible in the browser, and observed events are no longer conflated with modeled fields. See [live-data-context-phase-4.md](live-data-context-phase-4.md).
