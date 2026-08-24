# NASA response cache policy

Origin memory entries retain a bounded stale copy after freshness expires. A retryable upstream or server failure may use it according to the data-class windows in [platform-resilience-phase-4.md](platform-resilience-phase-4.md). Stale fallback is never silent: `x-cache: STALE`, `x-data-status: stale-fallback`, `Age`, and HTTP `Warning: 110` distinguish it from a cache hit or fresh retrieval.

NASA Mission Control caches only successful, public, normalized NASA responses. The data contains no accounts, cookies, personalization, or credentials, so identical URLs can be shared safely across visitors.

## Cache layers

1. TanStack Query avoids duplicate browser requests during a session.
2. A bounded in-process LRU-style cache reduces repeated NASA calls while a server instance remains warm.
3. Vercel’s CDN stores complete successful API responses near visitors and can refresh stale entries in the background.

The NASA key never appears in a cache key, response body, or response header.

## Policies

| Data class                                 |    Browser | CDN fresh | Stale while revalidating |
| ------------------------------------------ | ---------: | --------: | -----------------------: |
| Live APOD, NeoWs, DONKI, latest EPIC       | 60 seconds | 5 minutes |               15 minutes |
| NASA Image Library searches                | 60 seconds |    1 hour |                    1 day |
| Historical APOD, dated EPIC, media details |  5 minutes |     1 day |                   7 days |

The browser policy is sent in `Cache-Control`. The shared policy is sent separately in `CDN-Cache-Control`, following Vercel’s targeted cache-control behavior.

Empty EPIC results remain `no-store` because an image sequence may appear later. Health checks, validation errors, upstream errors, unexpected failures, and client telemetry also remain `no-store` and never receive shared-cache headers.

## Diagnostics

- `x-vercel-cache` reports Vercel edge states such as `MISS`, `HIT`, `STALE`, or `REVALIDATED`.
- `x-cache` reports the server instance’s in-memory NASA cache as `MISS` or `HIT`. A response stored at the CDN may preserve the origin value from the response that populated it, so use `x-vercel-cache` when diagnosing edge behavior.
- Browser developer tools often send `Pragma: no-cache`, which can force synchronous CDN revalidation and change timing during an audit.

Example:

```sh
curl -I "https://nasa-mission-control-alpha.vercel.app/api/apod?date=2024-01-01"
```

Repeat the request without changing the URL and inspect `x-vercel-cache`. Cache residency is regional and best-effort, so a first request from another region may still be a miss.

## Changes

Use short policies for observations that may change and archive policies only for records addressed by a stable historical identifier or date. Never apply shared caching to authenticated, personalized, sensitive, or failed responses.
