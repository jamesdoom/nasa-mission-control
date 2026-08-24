# Production operations

NASA Mission Control runs as a Vite single-page application with same-origin Express routes deployed through Vercel. This runbook keeps the portfolio’s reliability claims proportional to the signals it actually collects.

## Automated signals

- GitHub Actions runs the complete quality pipeline on every push and pull request.
- `Production smoke` runs twice per hour and can also be started manually. It checks health, APOD archive and media contracts, invalid-request mapping, four critical SPA routes, response latency, and cache headers. A route alerts only after both bounded attempts fail.
- `Preview smoke` runs after a successful non-production deployment and applies the same contracts and thresholds to the deployment URL before review.
- `Production performance` runs daily, checks desktop/mobile rendering and stability budgets, and retains a JSON evidence artifact for 30 days.
- `Mission status review` runs monthly, checks curated review deadlines and official NASA source availability, and retains its evidence for 90 days. It deliberately requires a human to confirm changing mission statuses.
- Vercel Runtime Logs contain structured request completion records, normalized upstream duration/outcome records, cache results, and sanitized `client.runtime_error` reports.
- Successful NASA routes expose `x-vercel-cache` for CDN diagnostics and `x-cache` for origin-memory diagnostics; see [caching.md](caching.md).
- `/api/health/reliability` exposes no-store, process-scoped cache ratios, categorized upstream failures, validation failures, and breaker state. Runtime Logs provide the durable timeline when retained or drained.
- The About page offers a user-triggered health check. It verifies the application API only.

These signals do not prove that APOD, NeoWs, DONKI, EPIC, GIBS, or the NASA Image Library is currently available. Each instrument handles its own upstream failure and retry state.

Run `npm run drill:resilience` before releases that change NASA schemas, caching, or error handling. The full degraded-mode drill and evidence template are documented in [platform-resilience-phase-4.md](platform-resilience-phase-4.md).

## Offline field console

The production build emits `sw.js` from the exact hashed JavaScript and CSS bundle. The service worker precaches the SPA shell, fonts, compact background, and every route chunk so curated Mission Archive, Guided Discovery, Trivia, Scale Lab, Mission Map, Flight Log, and About content can render without a network after installation. Same-origin static images are cached only after use to avoid a multi-megabyte initial install.

Live `/api` requests bypass the service worker entirely. An offline NASA instrument must therefore show its normal connection failure while the global banner explains local mode; cached data must never be described as newly retrieved telemetry. Run `npm run build && npm run offline:verify` whenever cache strategy or bundling changes. A waiting version is activated only after the user chooses **Update and reload**, which avoids replacing an in-progress session without notice.

## Curated mission review

```bash
npm run review:missions -- --check-sources
```

Active mission records expire after 90 days, extended records after 60 days, and completed records after one year. When the workflow reports an overdue record, read its linked official NASA sources, correct any changed facts or status, and update `verifiedAt` only after completing that review. HTTP availability alone is not evidence that the content remains accurate.

## Alert thresholds and ownership

| Signal                |                                                     Threshold | Escalation                                                                             |
| --------------------- | ------------------------------------------------------------: | -------------------------------------------------------------------------------------- |
| Health                |                               1.5 s or invalid contract twice | Treat as application incident. Inspect deployment and runtime logs immediately.        |
| Normalized API routes |             5 s, unexpected status, or invalid contract twice | Separate application failures from named NASA upstream failures using structured logs. |
| Critical SPA routes   |      3 s, non-200 response, or missing application root twice | Inspect deployment, rewrite configuration, and static assets.                          |
| Browser performance   | TTFB 1.5 s, FCP 3 s, heading 5 s, CLS 0.1, or 1.2 MB transfer | Investigate the affected route before the next release.                                |
| Browser runtime       |     Any same-origin console, page, request, or resource error | Treat as a release regression. Third-party failures remain diagnostic only.            |

GitHub’s failed workflow notification is the default alert channel and the JSON
artifact is retained for 30 days. Repository maintainers own first response.
This is a dependable portfolio monitor, not a contractual SLA: GitHub schedules
may be delayed, and no external pager or Vercel Drain is currently claimed.

## Manual smoke test

```bash
npm run smoke:production
```

Override the target only when intentionally checking a preview or alternate domain:

```powershell
$env:PRODUCTION_URL="https://example.vercel.app"
npm run smoke:production
```

The script performs read-only HTTPS requests and never reads or sends `NASA_API_KEY`.

`npm run smoke:journeys` uses a disposable browser profile to verify a curated
mission, Flight Log notes and saved views across reload, comparison bookmarks,
and 390-pixel reflow. Its writes are browser-local only; there is no account or
server synchronization endpoint.

## Preview release gate

1. Push a branch and wait for Vercel’s preview deployment to report success.
2. Confirm `Preview smoke` passes for that exact deployment SHA and URL.
3. Run the full CI gate and review the preview on desktop and mobile.
4. Inspect Runtime Logs for new `request.unhandled_error`,
   `upstream.request_failed`, or `client.runtime_error` entries.
5. Promote the already-tested artifact; do not rebuild a different artifact for
   production.

## Triage sequence

1. Check the latest GitHub `Production smoke` and CI runs.
2. Open `/api/health`. If it fails, inspect the current Vercel deployment and Runtime Logs.
3. If health succeeds but an instrument fails, use its request reference to locate the structured log entry and identify timeout, rate-limit, malformed-data, or upstream status mapping.
4. Reproduce with the same URL-backed date, filter, or search state.
5. Confirm whether the official NASA service is available before changing schemas or relaxing validation.
6. Fix forward, run every quality gate, and verify the public deployment. Roll back in Vercel when the current deployment is unsafe, broadly unusable, corrupts local data, or fails two consecutive critical checks.

## Incident and rollback procedure

1. **Acknowledge:** record the start time, failing workflow/check, affected
   routes, and the last known-good commit. Do not include visitor data or API
   keys.
2. **Classify:** application outage, degraded NASA upstream, performance
   regression, stale curated content, or false alarm. NASA degradation should
   preserve curated/offline routes and honest error states.
3. **Contain:** if the deployment causes broad failure or data loss risk, use
   `vercel rollback <known-good-deployment>` or promote the verified known-good
   deployment. Otherwise fix forward on a branch.
4. **Verify:** run `npm run smoke:production`, `npm run smoke:journeys`, inspect
   runtime errors, and confirm the production alias targets the intended commit.
5. **Communicate:** update the repository issue or release note with scope,
   current status, limitations, and next checkpoint. Never claim NASA recovery
   before its route succeeds.
6. **Close:** document cause, detection gap, duration, corrective action, and a
   regression test. Rotate credentials only when exposure is plausible.

Rollback commands require an authenticated maintainer and should first be
checked with `vercel inspect <deployment-url>`. `vercel rollback` changes the
production alias; it does not undo local Flight Log data in visitors’ browsers.

## Monitoring limits

Scheduled GitHub workflows provide visible failures but are not a service-level monitoring platform. GitHub may delay scheduled jobs during load and can disable schedules on inactive repositories. Runtime logs are queried in Vercel rather than exported: no Pro/Enterprise Drain or third-party incident pager is configured by this repository. Add a signed Drain and dedicated external monitor only if the project adopts an uptime target and notification owner that justify them.
