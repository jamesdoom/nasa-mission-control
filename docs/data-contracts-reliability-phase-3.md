# Data contracts and reliability evidence — Phase 3

## Contract evidence

Sanitized, minimized fixtures cover APOD, NeoWs, DONKI flare/CME/storm responses, EPIC availability and natural imagery, NASA Media search, and NASA Media asset manifests. They contain no API keys, request identifiers, or user data. Each fixture is normalized through the same server boundary used in production.

Mutation tests remove one required field from every upstream contract and require a stable 502 response plus an `upstream.schema_drift` record containing the upstream host, path, issue code, and first failing field. This makes a NASA shape change actionable without returning upstream payloads to clients.

The fixture shapes were checked on 2026-08-25 against the official [NASA Open APIs](https://api.nasa.gov/), [EPIC API](https://epic.gsfc.nasa.gov/about/api), and [NASA Image and Video Library API](https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf). Fixtures are regression evidence, not a claim that upstream schemas are permanently stable.

## Durable rolling evidence

`Reliability trends` runs daily and makes two bounded requests to each normalized APOD, asteroid, DONKI, EPIC, and NASA Media route. It records response status, duration, origin cache result, edge cache result, and stale-data status. The successful prior run artifact is restored, merged, trimmed to 90 days, and uploaded again. The generated summary reports a rolling 30-day view suitable for the monthly product review.

Process-local `/api/health/reliability` counters are also captured. Cumulative counters sharing the same process start time are de-duplicated by their maximum before aggregation. Route observations remain useful when serverless routing places the health request on a different warm instance.

Run the deterministic aggregation test with `npm run reliability:check`. Run the read-only production capture with `npm run reliability:capture`; set `PRODUCTION_URL` only when intentionally auditing an alternate deployment.

## Thresholds

| Signal            |                       Review threshold | Reasoning                                                                                |
| ----------------- | -------------------------------------: | ---------------------------------------------------------------------------------------- |
| Schema validation |                   Any recorded failure | A required-field mismatch can silently corrupt normalization if ignored.                 |
| Route failures    | More than 5% and at least two failures | Two daily attempts avoid alerting on one isolated transport failure.                     |
| Route p95 latency |   Over 5 seconds after 10 observations | Matches the existing normalized-route production ceiling while requiring evidence depth. |
| Stale fallback    |         Over 10% after 10 observations | Stale service is useful but should not become the normal state unnoticed.                |
| Cache hit ratio   |  Under 20% after 20 cache observations | Diagnostic only; route mix and serverless churn can make a low ratio non-incident.       |

Threshold failures fail the workflow and use GitHub's normal failed-run notification. They are evidence-based maintenance triggers, not an uptime SLA or external paging promise. Thresholds must be reviewed after the first complete 30-day window rather than relaxed in response to a single failure.

## Monthly review

The accountable monthly issue links to the reliability workflow. Review the latest JSON and Markdown artifacts for cache-hit ratios, stale frequency, validation failures, latency distribution, upstream failure categories, and threshold movement. Record any threshold change and its evidence in the issue and update the improvement backlog.
