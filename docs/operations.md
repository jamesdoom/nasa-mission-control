# Production operations

NASA Mission Control runs as a Vite single-page application with same-origin Express routes deployed through Vercel. This runbook keeps the portfolio’s reliability claims proportional to the signals it actually collects.

## Automated signals

- GitHub Actions runs the complete quality pipeline on every push and pull request.
- `Production smoke` runs every six hours and can also be started manually. It checks the public `/api/health` contract, its `no-store` policy, and the `/about` SPA rewrite.
- Vercel Runtime Logs contain structured request completion records and sanitized `client.runtime_error` reports.
- The About page offers a user-triggered health check. It verifies the application API only.

These signals do not prove that APOD, NeoWs, DONKI, EPIC, GIBS, or the NASA Image Library is currently available. Each instrument handles its own upstream failure and retry state.

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

## Triage sequence

1. Check the latest GitHub `Production smoke` and CI runs.
2. Open `/api/health`. If it fails, inspect the current Vercel deployment and Runtime Logs.
3. If health succeeds but an instrument fails, use its request reference to locate the structured log entry and identify timeout, rate-limit, malformed-data, or upstream status mapping.
4. Reproduce with the same URL-backed date, filter, or search state.
5. Confirm whether the official NASA service is available before changing schemas or relaxing validation.
6. Fix forward, run every quality gate, and verify the public deployment. Roll back in Vercel only when the current deployment itself is unsafe or broadly unusable.

## Alerting limits

Scheduled GitHub workflows provide visible failures but are not a service-level monitoring platform. GitHub may delay scheduled jobs during load and can disable schedules on inactive repositories. Add a dedicated external monitor only if the project adopts an uptime target that justifies another service and notification path.
