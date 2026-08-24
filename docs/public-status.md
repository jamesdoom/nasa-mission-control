# Public operational status

**Current summary (reviewed 2026-08-24):** NASA Mission Control’s application health endpoint, critical routes, and selected browser journeys are checked automatically. The project has no contractual uptime target and does not claim continuous availability.

## What is checked

- Application health and normalized APOD/media contracts twice per hour through scheduled GitHub Actions, with one bounded retry.
- Critical SPA routes, cache headers, response latency thresholds, and invalid-request behavior.
- Daily desktop/mobile performance and browser-local continuity journeys.
- Monthly curated mission review deadlines and official source availability.
- Per-process upstream categories, schema validation failures, circuit state, cache outcomes, and explicitly marked stale fallback through structured Runtime Logs.

A green application health response means the same-origin Express API is responding. It does not prove APOD, NeoWs, DONKI, EPIC, GIBS, the NASA Image and Video Library, or every image asset is available.

## Degraded behavior

Curated routes and a previously installed offline shell can remain usable during upstream or network disruption. Live API requests are never served by the service worker. A bounded normalized fallback is labeled `x-cache: STALE`, `x-data-status: stale-fallback`, and HTTP `Warning: 110`; it must not be described as a fresh NASA retrieval.

## Monitoring limits

GitHub schedules can be delayed or disabled, Vercel Runtime Logs are not a dedicated external pager, in-process counters reset when an instance restarts, and no public incident-history service or SLA is claimed. Failures in scheduled checks create visible repository workflow failures; maintainers own review during active maintenance.

For current details, inspect the repository’s [Actions history](https://github.com/jamesdoom/nasa-mission-control/actions), `operations.md`, and `service-limitations.md`. Product feedback and accessibility barriers should use the structured repository forms linked from the About page. Do not submit private Flight Log data.
