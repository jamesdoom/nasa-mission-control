# DONKI API migration — 2026-10-08

The production space-weather probe returned HTTP 502 with UPSTREAM_UNAVAILABLE and the message "NASA returned an unexpected response." Correlated Vercel logs for request d43e1a7d-396a-4f7c-9fd4-c58d49738eab show /DONKI/CME returning HTTP 200 with a non-JSON content type; concurrent FLR and GST calls failed at the network boundary. No schema-drift event was observed for this request. This identifies a current transport/content-type failure; it does not establish the cause of every historical failure.

NASA's [September 30 migration announcement](https://ccmc.gsfc.nasa.gov/news/major-updates/) replaces the legacy CCMC base https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/ with https://ccmc.gsfc.nasa.gov/DONKI-API/get/. NASA explicitly states that input parameters and response formats are unchanged and requests updates to automated clients. The [DONKI overview](https://ccmc.gsfc.nasa.gov/tools/DONKI/) and [API reference](https://ccmc.gsfc.nasa.gov/DONKI/api/) were checked October 8.

The server now requests FLR, CME, and GST directly from the documented public API with startDate and endDate. It sends no NASA API key to CCMC. NeoWs still requires the server-owned key. Existing Zod validation, shared request deadlines, circuit breaking, cache policy, stale fallback, and complete-feed error behavior remain in place. A category failure continues to produce a mapped error rather than an apparently complete partial chronology.

Regression coverage checks all three replacement URLs, date filters, credential exclusion, single-category requests, empty results, rejection of non-JSON responses, existing fixture normalization and schema-drift diagnostics, and aggregate deadline cancellation.

Direct NASA requests from this workstation timed out during investigation. Deployment validation must check the monitored historical range and a recent range against the real service before claiming production recovery. NASA supplies DONKI as preliminary research information without availability or accuracy guarantees; it is not an operational forecast. The 30-day history remains incomplete and past failures remain part of the rolling window. A successful post-fix probe cannot establish sustained reliability or fill missing days.

## Local validation

Strict type checking, ESLint, Prettier, all 195 workspace unit/component/accessibility tests, and all 48 production-preview browser tests passed. The production build, compressed asset budgets, and offline-shell checks passed. Final diff review confirmed that only the DONKI transport URL and query credentials changed in application code; client contracts and scientific interpretation remain unchanged.
