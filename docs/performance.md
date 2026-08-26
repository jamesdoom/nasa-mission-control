# Performance evidence

NASA Mission Control uses two complementary forms of performance evidence:

- Vercel Speed Insights collects route-level Core Web Vitals from real production visits.
- A deterministic CI check measures the compressed JavaScript and CSS produced by Vite.
- A daily Playwright audit captures consistent desktop/mobile production measurements and runtime stability signals.

No general visitor analytics, advertising identifiers, accounts, or custom tracking events are included.

## Reproduce the bundle evidence

```sh
npm run build
npm run performance:budget
```

The check reports gzip sizes and fails when any limit is exceeded:

| Evidence                 |       Budget |
| ------------------------ | -----------: |
| Largest JavaScript asset |  110 kB gzip |
| All JavaScript assets    |  190 kB gzip |
| All CSS assets           |   26 kB gzip |
| Mission Archive cards    | 400 kB total |

The limits leave a small, deliberate margin above verified builds. Phase 5 raised the CSS ceiling from 16 to 18 kB to accommodate the responsive Celestial Scale Laboratory controls, logarithmic plot, evidence cards, and reduced-width layouts; its measured addition was about 0.6 kB gzip. Phase 6 raised the aggregate JavaScript ceiling from 160 to 162 kB for the reusable provenance disclosure, freshness guidance, glossary, and route-arrival correction. Phase 7 raised aggregate JavaScript to 164 kB and CSS to 18.25 kB for the lazy-loaded unified Discovery Index. Phase 8 raised aggregate JavaScript to 167 kB and CSS to 19.25 kB for the accessible mission map, orbit plot, responsive controls, and structured record view. Experience refinement phase 1 raised the aggregate ceilings to 168 kB JavaScript and 20.5 kB CSS for grouped navigation, evidence-label onboarding, task-oriented starting routes, 44-pixel coarse-pointer targets, zoom resilience, and forced-colors support. Scientific storytelling phase 2 raised the aggregate ceilings to 174 kB JavaScript and 21.5 kB CSS for three typed narrative datasets, a dedicated lazy-loaded story route, evidence-sequence cards, responsive chronology, source panels, and integrity coverage. Local-first personalization phase 3 raised them to 177 kB JavaScript and 22 kB CSS after measuring 175.6 kB and 21.7 kB. Search and discovery intelligence phase 1 raised JavaScript to 181 kB after measuring 179.3 kB. Deeper scientific analysis phase 2 raised the aggregate ceilings to 186 kB JavaScript and 23 kB CSS after measuring 183.5 kB and 22.3 kB. Guided learning phase 3 raised JavaScript to 191 kB after measuring 188.1 kB; its independently split route contains three track definitions, the validated local-progress store, knowledge checks, reflection and export controls, and educator session rendering. Raising a limit requires an explanation because a passing budget should not conceal an avoidable regression.

Continuous improvement phase 5 replaced the general-purpose client query dependency with a bounded 100-entry cache tailored to the product's actual fetch state, retry, refetch, placeholder, timestamp, and freshness needs. Total JavaScript fell from 188.7 to 178.4 kB gzip and the entry chunk fell from 110.3 to 100.0 kB, recovering 10.3 kB total. The budgets were tightened to 184 kB total and 110 kB largest, preserving at least 5 kB measured headroom rather than treating the reduction as permission for immediate growth.

Content improvement phase 2 expanded the trivia bank from 12 to 64 records while moving curated question data into a runtime-validated, offline-precached static JSON asset. That build measured 177.3 kB total JavaScript gzip, leaving 6.7 kB below the aggregate budget.

Presentation improvement phase 3 expands that same static asset from 64 to 96 records, so the reviewed question content remains outside JavaScript and offline-precache behavior is unchanged. The client adds only bounded local-history ordering for repeat sessions; the unchanged production budget remains the release gate.

Content improvement phase 3 adds reviewed enrichment for all missions, stories, and learning tracks in a shared lazy-loaded 3.6 kB gzip chunk. The verified build measures 181.5 kB total JavaScript gzip, leaving 2.5 kB below the unchanged 184 kB aggregate budget; the main entry remains below its separate 110 kB limit. This is acceptable for the content release but below the earlier 5 kB aggregate target, so later content growth should move editorial payloads to validated static assets before adding more JavaScript-resident copy.

Content improvement phase 4 adds shared interpretation guidance and propagates explicit stale-fallback state into the interface. After copy compression, the verified build measures 183.8 kB total JavaScript gzip and 100.2 kB for the largest chunk, passing the unchanged 184/110 kB limits with 0.2/9.8 kB headroom. Aggregate margin is effectively exhausted; Phase 5 must recover headroom or move shared editorial payloads to validated static content before any further JavaScript growth.

Immersive art-direction phase 1 adds a shared route-atmosphere classifier and a tokenized, CSS-only depth layer for mission, Earth, live-instrument, learning, and command surfaces. The verified build measures about 184 kB JavaScript and 23.9 kB CSS gzip. The aggregate ceilings are reset to 190 kB JavaScript and 26 kB CSS, leaving roughly 6 kB and 2 kB of measured room while keeping the largest entry limit unchanged. This is a deliberate visual-system allocation; later phases must reuse these tokens rather than adding independent atmospheric frameworks.

Cinematic missions and stories phase 2 reuses the shared atmosphere rather than introducing another rendering system. Sourced story-image metadata, semantic hero figures, mission flight-path navigation, and the responsive narrative structure bring the verified build to 184.5 kB JavaScript and 24.1 kB CSS gzip, retaining 5.5 kB and 1.9 kB beneath the existing aggregate ceilings. The NASA images are existing optimized local mission assets, so the phase adds no new image transfer payload.

## Interpret real-user results

Use the Vercel project’s Speed Insights view after production has received enough traffic. Evaluate routes independently and use the standard “good” thresholds as goals:

- LCP below 2.5 seconds
- INP below 200 milliseconds
- CLS below 0.1

Small samples are directional rather than conclusive. Before changing code, confirm that a weak metric persists across multiple visits and is not isolated to a single device or network class.

## Synthetic production audit

```sh
npm run audit:production
```

The audit warms the production origin once to keep runner DNS and TLS setup from masquerading as application TTFB, then checks the dashboard at desktop and mobile sizes, the About case study, the Mission Archive at desktop and mobile sizes, an Artemis I mission record, and Guided Discovery at desktop and mobile sizes. It records connection-plus-response time separately while budgeting server TTFB, FCP, heading readiness, CLS, and same-origin encoded transfer size. It also fails on non-200 navigation, same-origin console or HTTP resource errors, application page errors, failed same-origin requests, and horizontal overflow. Console and HTTP failures from third-party embeds remain in the JSON diagnostics but do not fail the application-controlled gate.

The initial Phase 9 baseline was:

| Scenario          |  TTFB |    FCP | LCP snapshot | CLS |
| ----------------- | ----: | -----: | -----------: | --: |
| Dashboard desktop | 40 ms | 436 ms |       436 ms |   0 |
| Dashboard mobile  | 31 ms | 296 ms |       328 ms |   0 |
| About desktop     | 33 ms | 292 ms |       364 ms |   0 |

These are synthetic observations from one run, not claims about every visitor. The scheduled workflow retains `production-performance.json` artifacts for 30 days so changes can be compared under the same methodology. It also restores and carries `asset-budget-trend.json` for up to 90 days, recording total/largest JavaScript, CSS, image weight, and current budget headroom across builds.

The Phase 13 route expansion identified a 1.77 MB desktop Mission Archive transfer caused by all ten full-resolution card images entering the browser's lazy-load threshold. Archive cards now use dedicated 720-pixel derivatives with a 400 kB aggregate build budget, while mission detail records retain their larger source images. Card URLs are assigned only when an IntersectionObserver places them within 300 pixels of the viewport, avoiding browser-specific native lazy-load distances that previously requested several below-fold rows during the initial desktop visit. The production audit enforces a 1.2 MB same-origin transfer ceiling per scenario. Browser transfer measurements are useful regression signals under consistent conditions, not a replacement for real-user Speed Insights data.

The Phase 10 portfolio baseline records that Mission Archive work as a reduction from approximately 1.77 MB to 0.86 MB on the audited desktop route, with zero measured layout shift. These values are reproducible evidence from the synthetic workflow, not a guarantee for every connection or device.

The Phase 5 public-release audit on 2026-08-24 passed all eight scenarios with
zero CLS, no same-origin console/resource/page failures, and no horizontal
overflow. Warm-route TTFB ranged from 33.3 to 58.3 ms; FCP ranged from 88 to 264
ms; and same-origin transfer ranged from 663.7 to 980.4 kB. The companion route
check observed health at 989 ms, archive APOD at 698 ms, media search at 1,000
ms, and cached SPA rewrites at 35–45 ms. These are one synthetic run retained as
release evidence, not an uptime or visitor-performance guarantee.

The Phase 2 operational audit on 2026-08-25 again passed all eight scenarios,
with TTFB from 7.2 to 33.3 ms, FCP from 60 to 276 ms, zero CLS, and transfers
below 1 MB. Its companion Flight Log journey had one transient click timeout
that passed immediately when reproduced. Production journey checks now retain
per-attempt timing and URL evidence, retry once, and capture a screenshot only
after the second failure; see [operational-evidence-phase-2.md](operational-evidence-phase-2.md).

## Optimization workflow

1. Identify the affected route and metric in Speed Insights.
2. Reproduce with browser performance tooling under a representative mobile viewport and throttled network.
3. Locate the responsible image, script, layout shift, or interaction.
4. Make the smallest targeted change.
5. Run the quality gates and bundle budget.
6. Compare production results after the next deployment has accumulated a useful sample.

The dashboard APOD media already reserves layout space, requests its visible image eagerly with high fetch priority, uses responsive candidates when NASA provides an HD URL, and keeps other route modules code-split.

The Phase 3 spacecraft-data presentation build on 2026-08-26 measures 184.6 kB total JavaScript gzip and 24.8 kB CSS gzip. It retains 5.4 kB of JavaScript and 1.2 kB of CSS budget headroom by using one shared instrument-token layer rather than five route-specific component systems.
