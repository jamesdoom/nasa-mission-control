# Platform resilience and data quality — Phase 4

## Failure isolation

Every NASA hostname has an independent in-process circuit breaker. Three consecutive retryable failures open only that hostname for 30 seconds. Calls fail fast while open; after the window, one half-open probe is allowed. A successful probe closes the breaker. Rate limits, 5xx responses, timeouts, and network failures count toward opening; expected 4xx responses do not.

This state is deliberately process-local. Serverless instances do not coordinate breakers, so the mechanism limits cascades within a warm instance rather than claiming fleet-wide control.

## Controlled stale fallback

Normalized values remain available after their freshness TTL only for retryable server/upstream errors. Invalid requests and not-found responses never receive unrelated stale data.

| Data class                                     | Maximum stale retention after origin TTL |
| ---------------------------------------------- | ---------------------------------------: |
| APOD latest, asteroid feed, DONKI, EPIC latest |                                   1 hour |
| Media search                                   |                                 24 hours |
| Historical APOD, historical EPIC, media detail |                                   7 days |

A fallback response is honest and machine-readable: `x-cache: STALE`, `x-data-status: stale-fallback`, an `Age` value, and HTTP `Warning: 110`. Fresh and origin-cache responses carry `x-data-status: current`. Empty EPIC results are not cached.

## Telemetry and alerts

`GET /api/health/reliability` exposes a no-store, current-process snapshot with cache hits, misses, stale fallbacks, hit ratios, breaker states, request successes, and categorized failures. Structured Runtime Log events use bounded labels and omit URLs, query values, API keys, payloads, and visitor identifiers.

Actionable events:

- `upstream.circuit_state` changing to `open`: investigate repeated failure for the named hostname.
- `upstream.schema_drift`: compare the named path with its sanitized fixture and current official NASA documentation. The log contains only issue count, Zod issue code, and field path.
- `upstream.failure_categorized`: separate rate limits, timeouts, transport errors, upstream HTTP classes, malformed JSON, validation failures, and fast circuit rejection.
- A rising stale count means visitors are receiving known-old normalized records. It is availability evidence, not successful upstream retrieval.

Snapshots reset on restart and are suitable for Runtime Log aggregation over time. Persistent trend dashboards require a configured log drain or external metrics owner; the repository does not claim durable in-process counters.

## Contract fixtures and drift policy

`apps/server/src/test/fixtures/nasa` contains minimized, sanitized captures of real APOD and NeoWs response shapes. Credentials and unnecessary narrative fields are removed or shortened; field names, nesting, scalar types, and representative optional values are retained. Fixtures were checked against NASA Open APIs and the official Image and Video Library API documentation on 2026-08-24.

Contract tests pass fixtures through the production normalizer. Removing a required field proves drift becomes a stable 502, categorized validation signal, and eligible stale fallback—not partially trusted output. Never relax a schema solely to silence an alert: compare a current response and official documentation, add a sanitized regression fixture, decide whether the change is compatible, then update normalization deliberately.

Official references:

- [NASA Open APIs: APOD and NeoWs](https://api.nasa.gov/)
- [NASA Image and Video Library API](https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf)
- [NASA CCMC DONKI](https://webtools.ccmc.gsfc.nasa.gov/DONKI/)
- [NASA EPIC API](https://epic.gsfc.nasa.gov/about/api)

## Degraded-mode and recovery drill

Run `npm run drill:resilience`. The automated exercise verifies fresh-to-stale-to-expired cache transitions, isolation between NASA hostnames, single half-open recovery probes, stable schema-drift failures, marked stale HTTP responses, and the no-store reliability endpoint.

Quarterly manual exercise:

1. Record the drill date, operator, commit, and expected stale windows.
2. In a disposable local environment, configure a test fetch adapter to fail one hostname three times; do not alter DNS or production traffic.
3. Confirm that hostname opens while another NASA hostname remains callable.
4. Seed a normalized value, advance beyond its freshness TTL, and confirm the route returns the same value with all stale headers. Confirm a 400/404 does not fall back.
5. Advance beyond the stale limit and confirm the route returns the stable retryable error.
6. Advance beyond 30 seconds, allow one recovery probe, and verify successful service closes the breaker.
7. Remove one required fixture field and confirm `upstream.schema_drift` identifies the field path without payload data.
8. Attach test output and sanitized telemetry snapshot to the drill record. Record gaps, owner, and due date; never claim upstream recovery until a real route succeeds.

Production containment and rollback remain in [operations.md](operations.md).
