# Public operational status

**Current summary (reviewed 2026-09-04):** NASA Mission Control’s application health endpoint, critical routes, and selected browser journeys are checked automatically. The project has no contractual uptime target and does not claim continuous availability.

## What is checked

- Application health and normalized APOD/media contracts twice per hour through scheduled GitHub Actions, with one bounded retry.
- Critical SPA routes, cache headers, response latency thresholds, and invalid-request behavior.
- Daily desktop/mobile performance and browser-local continuity journeys.
- Daily compressed-asset measurements carried in a private 90-day trend artifact.
- Daily normalized-route samples with a rolling 30-day reliability summary retained through private workflow artifacts.
- Monthly curated mission review deadlines and official source availability.
- Per-process upstream categories, schema validation failures, circuit state, cache outcomes, and explicitly marked stale fallback through structured Runtime Logs.

A green application health response means the same-origin Express API is responding. It does not prove APOD, NeoWs, DONKI, EPIC, GIBS, the NASA Image and Video Library, or every image asset is available.

The owned improvement-cycle register is checked during monthly review and release preflight. It records technical journey and accessibility coverage, current evidence paths, backlog scores, and unresolved limits. It is an operating control—not evidence of user satisfaction, screen-reader conformance, uptime, or learning effectiveness.

## Degraded behavior

Curated routes and a previously installed offline shell can remain usable during upstream or network disruption. Live API requests are never served by the service worker. A bounded normalized fallback is labeled `x-cache: STALE`, `x-data-status: stale-fallback`, and HTTP `Warning: 110`; it must not be described as a fresh NASA retrieval.

## Monitoring limits

GitHub schedules can be delayed or disabled, artifact deletion can restart the rolling history, Vercel Runtime Logs are not a dedicated external pager, in-process counters reset when an instance restarts, and no public incident-history service or SLA is claimed. Failures in scheduled checks create visible repository workflow failures; maintainers own review during active maintenance.

The daily reliability monitor recorded repeated DONKI-backed space-weather failures from August 28 through September 3, 2026. The production probe returned current data again on September 4. This is a reviewed upstream incident and recovery, not an uptime guarantee; the rolling alert will remain visible until enough successful observations reduce the 30-day failure ratio below its threshold.

For current details, inspect the repository’s [Actions history](https://github.com/jamesdoom/nasa-mission-control/actions), `operations.md`, and `service-limitations.md`. Product feedback and accessibility barriers should use the structured repository forms linked from the About page. Do not submit private Flight Log data.
