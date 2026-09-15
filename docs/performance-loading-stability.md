# Performance phase 3: loading stability and measurement

The deployed baseline matched build f21957d4cb. The old audit passed but sampled only 1.5 seconds after heading readiness and rounded CLS to one decimal. A longer diagnostic run exposed a mobile dashboard CLS budget failure. Live results vary with content, cache, and response timing and are not controlled before/after evidence.

## Changes

- Reserve the daily-image loading area so arriving data does not push the following section down from the initial viewport.
- Use optional font display to avoid late font swaps. A slow first visit may retain a readable system font; a subsequent visit can use the cached custom fonts. The dashboard heading has enough line spacing for either font. This follows [web.dev font guidance](https://web.dev/articles/optimize-cls).
- Observe production pages for six seconds after heading readiness, include mobile APOD, retain CLS precision, and calculate the maximum shift session rather than summing across the page lifetime. Session boundaries follow [the CLS definition](https://web.dev/articles/cls).
- Report pending, deferred, and broken images separately, and fail the audit if loading panels remain at cutoff. Offscreen mission images without a requested source are deferred, not broken. LCP remains provisional within the window.

## Controlled verification

Run `npm run build`, then `node scripts/measure-loading-stability.mjs artifacts/loading-stability.json`. The probe serves the local build, uses fresh Chromium contexts at 390px and 1440px widths, delays fonts by 800ms and mock API responses by 1200ms, disables service workers and motion, and measures session CLS. It produces JSON and viewport captures. This is a synthetic experiment, not real-user Core Web Vitals.

Baseline CLS: mobile 0.083828; desktop 0.026325. Final CLS: mobile 0; desktop 0.001788. Final results are retained in [after measurements](loading-stability-after.json), alongside [before measurements](loading-stability-before.json).

Validation includes typecheck, lint, unit/component/accessibility tests, production build, asset/offline budgets, production browser smoke coverage, and `node --test scripts/layout-shift.test.mjs`. The metric tests protect session boundaries and precision; a browser regression delays fonts and data and enforces the mobile 0.1 CLS budget. No NASA integration or reliability threshold was changed.

The controlled probe and visual inspection support this change. A deployment audit still depends on live upstream availability; six seconds cannot guarantee that every external image has completed. Network/CPU throttling and field-user collection are outside this phase.

All 46 production browser tests passed. Visual evidence: [mobile](screenshots/loading-stability/mobile.png), [desktop](screenshots/loading-stability/desktop.png).
