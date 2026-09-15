# Performance: startup and request efficiency

Completed phase 1. Deferred service-worker registration until one second after the document load event. All offline assets remain precached; offline readiness is delayed accordingly. This reduces early competition rather than total offline bytes. Network-loaded APOD media can arrive after document load, so this does not guarantee all late media has finished.

Earth, Media search/detail, and Space Weather now reuse successful query results for five minutes on repeat visits. This is browser-session caching, not a claim that upstream records are fresh for five minutes. Existing retrieval timestamps remain visible; explicit refetch bypasses freshness. Failed cache entries are revalidated rather than treated as fresh.

The query layer waits one second before the first automatic retry, doubles subsequent waits up to eight seconds, and cancels data requests after the last consumer leaves. Shared consumers retain their request. Cancellation does not become an error or start another retry. Internal API functions accept the shared signal; NASA endpoints, server caching, and reliability thresholds are unchanged.

Validation: types, lint, unit/component/accessibility tests, production build, and production browser coverage passed (43 initially plus the corrected navigation test on retry). Tests verify shared cancellation, expired-cache revalidation, retry timing, and registration after load. The repeat-visit browser test observes one Space Weather request across leaving and returning; offline installation preserves the current date and makes the offline shell ready.

No real-user speedup or Core Web Vitals improvement is claimed. The next measured opportunity is rendering: a 390px 2x dashboard probe downloaded both 960px and 1600px backgrounds, with three hero animations still running after scrolling away.
