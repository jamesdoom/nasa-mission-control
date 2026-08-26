# Live-data explanations and context — phase 4

Completed 2026-08-26. This phase improves interpretation of the existing APOD, NeoWs, DONKI, EPIC, and NASA Image and Video Library journeys without adding a data category or product feature.

## Interpretation standard

Every journey now answers the same three questions in a semantic description list:

1. **Freshness:** how the source is published, why the newest record may lag, and why retrieval time is not necessarily observation time.
2. **What is displayed:** which fields come from NASA and which summaries, rankings, or counts are calculated locally.
3. **What it cannot show:** the unsupported conclusions users must not draw from a record, empty result, comparison, or visual summary.

The explanations were reviewed against current official NASA API, NASA/JPL CNEOS, CCMC DONKI, DSCOVR EPIC, and NASA media documentation on 2026-08-26. DONKI remains preliminary experimental research rather than the official U.S. forecast. EPIC is a processed archive rather than a webcam. NeoWs diameter and approach values are estimates or catalog predictions, and a potentially hazardous classification is not an impact prediction. APOD is a dated editorial selection, and NASA Media search reflects indexed metadata rather than a complete scientific catalog.

## State and evidence corrections

- Loading messages now identify the source and operation instead of describing every request as deep-space telemetry.
- Empty states explicitly distinguish “no returned records” from “no physical event or relevant source material exists.”
- The client preserves the server’s `x-data-status: stale-fallback` response header. Degraded responses are visibly labeled as older validated data used because NASA was unavailable.
- DONKI event types remain observed event records; individual CME analysis values are described as modeled or analyzed rather than labeling the entire event modeled.
- Asteroid tables say “catalog approach” instead of implying that a future closest approach has already been observed.
- Existing visual summaries retain adjacent semantic tables, exact values, evidence labels, UTC timestamps, units, and captions describing the same source rows.

## Reproducible evidence

Component tests require context coverage for all five sources and verify that stale fallback status reaches the accessible interface. Existing scientific-analysis tests continue requiring tables beside APOD, asteroid, DONKI, and EPIC summaries. Strict types, lint, unit/accessibility tests, production build, compressed-asset budget, offline verification, and Playwright journeys remain release gates.

The verified production build totals 183.8 kB JavaScript gzip against the unchanged 184 kB limit. The shared context chunk is 1.3 kB gzip and lazy-loaded only by affected routes. With 0.2 kB aggregate headroom remaining, the next content phase must recover margin or externalize editorial payloads before adding more JavaScript-resident copy.
