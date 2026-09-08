# Reliability reporting and timeout investigation — 2026-09-08

## Outcome

CDN and origin cache measurements are separated in history schema 3. The 30-day alert window and all alert thresholds remain unchanged. Historical raw observations remain intact and are reaggregated using the corrected semantics.

- CDN hit ratio counts HIT among recognized HIT/MISS/STALE/REVALIDATED/BYPASS/PRERENDER observations. CDN stale responses are reported separately.
- Origin hit ratio uses x-cache only when x-vercel-cache indicates MISS, BYPASS, or REVALIDATED. Headers replayed by CDN HIT/STALE/PRERENDER responses do not count as a new origin lookup. Missing or unknown CDN state is excluded; ratios without eligible observations read n/a. Each ratio shows its denominator.
- Application stale fallback still counts delivered fallback data, including cached fallback responses. CDN STALE alone does not imply an application fallback. The existing fallback alert remains active.
- Process counters remain a separately deduplicated, current-process sample, not a complete fleet census. Zero observed validation failures does not prove no failures occurred elsewhere.

These distinctions follow [Vercel response-header semantics](https://vercel.com/docs/headers/response-headers), checked September 8, 2026.

## Historical Space Weather trace

The supplied report contains 12 failures among 28 observations. Ten have HTTP 502 and UPSTREAM_UNAVAILABLE with a response request reference. Two lack useful correlation references. That application code alone cannot distinguish an upstream HTTP failure from an unexpected content type or malformed body. The all-category route calls FLR, CME, and GST concurrently; failure of one prevents a complete feed.

Each supplied reference was searched in Vercel runtime logs over 30 days on September 8, 2026, around 16:55 UTC. Every search returned no logs, with a runtime-retention warning (the connected team is Hobby). Broad route searches timed out; narrowing to the earlier production deployment also returned no retained failures. Exact historical endpoint/status attribution remains unresolved; no root cause is inferred from the durations.

| Response reference                   | Trace result      |
| ------------------------------------ | ----------------- |
| 5ca6799f-5680-4c80-a820-35f5074acb46 | No retained match |
| ef899cde-3601-4761-8ac3-259794a309f9 | No retained match |
| 43ec2e90-b832-45f7-a562-6999c69ff329 | No retained match |
| 79650fa0-27d7-4f73-933b-996514ad1a14 | No retained match |
| 7f0aeefd-815d-45c3-b01a-b167d880e18d | No retained match |
| 52b37cd8-f669-4544-8f8c-7378c5e3fd9b | No retained match |
| 993d6925-a471-4d5c-9d36-e1126f54ddb7 | No retained match |
| fec3dd43-88cc-4314-b2b8-bdbf22d5080b | No retained match |
| 44938950-ff5b-4f16-a480-c1119e38429c | No retained match |
| 1cdd7f89-bdfa-4571-a3f4-63bb0137e43e | No retained match |

A deployment-scoped query did retrieve a recent successful background revalidation on production deployment dpl_7dqY6Vcd4XgwpRUpcsSCgqdq7CfJ. At 16:47:12 UTC, /DONKI/FLR returned 200 in 701 ms, /DONKI/GST returned 200 in 681 ms, and /DONKI/CME returned 200 in 1015 ms. The enclosing application request 88b145ed-d3bf-4ef1-9b15-b89700c595d0 completed HTTP 200 in 1198 ms with origin MISS. Its edge response was STALE. This is evidence of that revalidation succeeding, not an explanation of the historical failures or a guarantee of continued availability.

The [official NASA CCMC documentation](https://ccmc.gsfc.nasa.gov/tools/DONKI/) was checked September 8, 2026: FLR, CME, and GST remain documented event families. NASA describes the information as research/prototyping quality. This change does not switch endpoints, alter NASA credentials/access requirements, or assume a NASA latency guarantee.

## Time budgets and future tracing

The trend monitor retains its 12000 ms transport deadline and 5000 ms p95 alert. Production smoke uses the same diagnostic deadline (previously 10000 ms), still failing checks beyond its unchanged health/API/page latency limits of 1500/5000/3000 ms. Both include body-consumption time. Every HTTP application request now shares a 10000 ms upstream deadline across sequential and parallel NASA calls, including response bodies. NASA_REQUEST_TIMEOUT_MS remains a per-call ceiling; a configured 30000 ms cannot extend the aggregate HTTP deadline. This leaves approximately two seconds for error mapping, stale fallback, and transport. Cold starts and network delay can still exhaust the monitor deadline, which remains a failure.

A response-body timeout is recorded as a timeout, not invalid JSON. Monitor durations include body consumption. HTTP status, application error code, per-attempt UTC timestamp, probe request ID, and returned response ID remain bounded diagnostics; response bodies are not retained. Probe IDs are sent as x-request-id and retained even on transport failure. CDN response IDs may refer to earlier requests, so both identifiers are labeled separately.

Async request context adds the application request ID to upstream logs, including host/path, status, duration, timeout, circuit-open, and body-failure events. Mapped 5xx responses also log their application code. Query strings and API keys are excluded. To trace a new failure, scope Vercel logs to its deployment and timestamp, search its probe/response reference, then inspect the associated /DONKI/FLR, /DONKI/CME, and /DONKI/GST entries. On the current short-retention plan this must happen promptly; these code changes do not extend platform retention or recover historical logs.

## Validation

Targeted regression checks cover cache-layer denominators, missing historical headers, unchanged alerts, full-body latency/timeouts, distinct probe/response IDs, concurrent request isolation, shared DONKI cancellation, and body timeout mapping. Typecheck, lint, formatting, workspace tests (including 53 server tests), production build, asset budgets, and all 42 production-preview browser tests passed. The actual HTTP deadline test returned a correlated 503 in about 10046 ms, before the 12000 ms monitor cutoff. Final diff review included credential exposure, request-context isolation, historical compatibility, and unchanged alert predicates. Read-only production smoke passed all eight checks.

A live capture at 17:02 UTC verified the new report against production CDN headers. It preserved the local historical sample in a separate artifact, so its two-sample summary is not the user's 14-sample alert history. APOD and Media had CDN hit ratios of 1 with origin n/a (zero eligible origin observations); Space Weather correctly separated CDN stale from application fallback. This check used the existing deployed application; application deadline/correlation changes require the commit's deployment.
