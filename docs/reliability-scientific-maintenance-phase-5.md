# Reliability and scientific maintenance — Phase 5

Reviewed 2026-09-08. Status: maintenance changes approved for release; **phase acceptance pending a complete 30-day operating window**. Owner: repository maintainer, acting for reliability and content owners. No participant findings are claimed.

## Retained operating evidence

Downloaded the unexpired `reliability-history` artifact from [run 34252530392](https://github.com/jamesdoom/nasa-mission-control/actions/runs/34252530392). It contains 14 samples, from 2026-08-26T13:18:44.434Z through 2026-09-08T16:41:06.459Z, matching all 14 runs returned by the workflow API. Local originals are in `artifacts/phase5/`; artifacts are intentionally ignored by Git. The existing 90-day workflow retention preserves the source evidence.

| Route         | Observations | Failures |      p95 |
| ------------- | -----------: | -------: | -------: |
| APOD          |           28 |        2 | 12002 ms |
| Asteroids     |           28 |        0 |  1332 ms |
| Space Weather |           28 |       12 | 11862 ms |
| Earth         |           28 |        0 |   760 ms |
| Media         |           28 |        0 |  1204 ms |

APOD has two transport timeouts. Space Weather has eleven HTTP 502 responses and one transport failure; ten responses carry `UPSTREAM_UNAVAILABLE`. All four existing failure/latency alerts remain justified. Zero recorded validation failures is inconclusive: **none of the 14 samples contains a process snapshot**. These fixed historical-date probes do not establish latest-data freshness or all-route availability; GIBS image delivery is not included.

The September 4 successful probe was a point observation, not sustained recovery. The [prior request-reference investigation](reliability-reporting-investigation.md) documents unavailable historical logs, one successful correlated DONKI request, and the shipped 10-second application deadline ahead of the 12-second monitoring deadline. Those changes improve bounded failure behavior and future diagnosis; they do not prove the NASA 502 cause is fixed. No speculative upstream switch, added retries, or relaxed alerts is justified by the retained evidence.

The report now separates rolling request statistics from coverage of the **last 30 completed UTC dates**. Coverage requires two attempted observations for each of the five monitored routes on each date; failures still count as observations. Missing dates/routes and absent process snapshots are explicit. September 8's review has 13/30 completed dates covered (August 26–September 7); the current day's sample remains in the rolling statistics. Daily sampling is not continuous uptime measurement.

Earliest full daily coverage is September 25, if every scheduled day through September 24 retains all route observations. At that point review the actual artifact, missing dates, recurring errors, and post-repair evidence; do not automatically close the phase based on the date alone.

## Official integration review

Read on September 8 and compared with `apps/server/src/lib/nasa-client.ts`. No external integration contract was changed.

| Integration        | Official source and reviewed assumptions                                                                                                                                                                                                                         | Decision                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| APOD               | [NASA implementation documentation](https://github.com/nasa/apod-api): date query, image/video types, optional HD/copyright/thumbnail fields; hosting-transition and reliability caveats remain published.                                                       | Retain normalization and timeout/fallback behavior; no availability guarantee.                                                   |
| NeoWs              | [NASA API catalog](https://api.nasa.gov/assets/json/apis.json): feed endpoint, `start_date`, `end_date`, key, closest-approach data.                                                                                                                             | Existing server feed integration remains supported.                                                                              |
| DONKI              | [CCMC documentation](https://ccmc.gsfc.nasa.gov/tools/DONKI/) and [NASA catalog](https://api.nasa.gov/assets/json/apis.json): FLR/CME/GST, UTC date parameters, event identifiers and measurements. CCMC publishes research products, not operational forecasts. | Keep existing endpoints and scientific caveats; documented direct services are not evidence of an independent reliable failover. |
| EPIC               | [EPIC API](https://epic.gsfc.nasa.gov/about/api): natural/enhanced collections, date and availability queries, dated archive paths.                                                                                                                              | Continue direct EPIC access; latest available is not necessarily today.                                                          |
| GIBS               | [NASA GIBS access guide](https://nasa-gibs.github.io/gibs-api-docs/access-basics/): geographic WMS endpoint and GetMap parameters.                                                                                                                               | Keep geographic WMS; image retrieval is separate from normalized route monitoring.                                               |
| Media              | [NASA library API](https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf): search filters, page numbering, image/video/audio types, asset endpoint.                                                                                                          | Keep search/asset normalization and graceful errors.                                                                             |
| Access/retirements | [NASA authentication](https://api.nasa.gov/assets/html/authentication.html): default key quota 1,000/hour; DEMO_KEY 30/hour and 50/day per IP. [NASA portal](https://api.nasa.gov/) marks legacy Earth and Mars Rover APIs archived.                             | Keep credentials server-side, development-only DEMO_KEY guidance, EPIC/GIBS replacements; do not restore retired modules.        |

## Scientific and product descriptions

Official mission pages still label [Curiosity](https://science.nasa.gov/mission/msl-curiosity/), [Perseverance](https://science.nasa.gov/mission/mars-2020-perseverance/), [Webb](https://science.nasa.gov/mission/webb/), [Hubble](https://science.nasa.gov/mission/hubble/), and [Parker](https://science.nasa.gov/mission/parker-solar-probe/) active. [Voyager 1](https://science.nasa.gov/mission/voyager/voyager-1/) explicitly remains extended. [Juno](https://science.nasa.gov/mission/juno/) is labeled active while its narrative retains the extension-to-2025 wording; retain the archive's extended classification, without inferring an end date from that old plan.

Refresh Curiosity's achievement list with its [August 26 one-kilometer elevation milestone](https://science.nasa.gov/mars/curiosity-reaches-1-kilometer-elevation-gain/), supported by its already-linked mission overview. Record this targeted update here; do not advance every record's whole-record verification date after a status-only check. Historical mission/trivia dates remain unchanged.

The source audit found 10 missions, no overdue records, and 36 reachable mission links. The editorial audit found 96 questions (24 per topic), full citation/clarity coverage, 73 unique URLs, no failures, and one DONKI fetch warning. The DONKI page was readable through the web research tool; retain the warning as transport evidence rather than removing a valid citation. Link reachability does not prove factual support.

README now describes 96 questions, truthful dashboard states, and shipped Phase 4 continuity. The next roadmap marks Phase 4 complete and Phase 5 pending. The current status page removes the unsupported sustained-recovery claim. The improvement register reflects Phase 4's 189.9/190 KiB JavaScript and 25.5/26 KiB CSS budgets; the dated September 4 review remains historical evidence.

## Completion gate

Keep this phase open until the complete window and recurring-failure follow-up are reviewed. The repository owner explicitly approved committing and pushing these tested maintenance changes before the full-window review. That release approval does not close the evidence gate. The existing daily workflow continues collecting evidence; no new automation is created.

## Validation

The dev-server smoke run exposed an existing dashboard-test interception bug: `**/api/**` also matched Vite source imports under `/src/api/`, returning mocked JSON as JavaScript. Narrowed interception to paths beginning `/api/`; the scenarios and assertions are unchanged. Production build budgets pass at 189.8 KiB JavaScript and 25.5 KiB CSS.

Passed: strict type checks, lint, changed-file formatting, 145 client tests (including accessibility), 53 server tests, reliability aggregation/probe checks, content and improvement-cycle audits, production build, and asset budgets. Browser coverage: 38 scenarios passed in the initial run, all seven corrected dashboard scenarios passed on retest, and the built service-worker scenario passed separately (46 total). No participant or manual screen-reader sessions are represented by these results.
