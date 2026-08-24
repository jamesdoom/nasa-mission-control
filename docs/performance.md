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
| Largest JavaScript asset |  120 kB gzip |
| All JavaScript assets    |  181 kB gzip |
| All CSS assets           |   22 kB gzip |
| Mission Archive cards    | 400 kB total |

The limits leave a small, deliberate margin above verified builds. Phase 5 raised the CSS ceiling from 16 to 18 kB to accommodate the responsive Celestial Scale Laboratory controls, logarithmic plot, evidence cards, and reduced-width layouts; its measured addition was about 0.6 kB gzip. Phase 6 raised the aggregate JavaScript ceiling from 160 to 162 kB for the reusable provenance disclosure, freshness guidance, glossary, and route-arrival correction. Phase 7 raised aggregate JavaScript to 164 kB and CSS to 18.25 kB for the lazy-loaded unified Discovery Index. Phase 8 raised aggregate JavaScript to 167 kB and CSS to 19.25 kB for the accessible mission map, orbit plot, responsive controls, and structured record view. Experience refinement phase 1 raised the aggregate ceilings to 168 kB JavaScript and 20.5 kB CSS for grouped navigation, evidence-label onboarding, task-oriented starting routes, 44-pixel coarse-pointer targets, zoom resilience, and forced-colors support. Scientific storytelling phase 2 raised the aggregate ceilings to 174 kB JavaScript and 21.5 kB CSS for three typed narrative datasets, a dedicated lazy-loaded story route, evidence-sequence cards, responsive chronology, source panels, and integrity coverage. Local-first personalization phase 3 raised them to 177 kB JavaScript and 22 kB CSS after measuring 175.6 kB and 21.7 kB. Search and discovery intelligence phase 1 raises JavaScript to 181 kB after measuring 179.3 kB; the 3.7 kB increase covers the independently split investigation route, typed facet metadata, explainable recommendation scoring, and command-search history. The largest entry chunk remains independently capped at 120 kB gzip. Raising a limit requires an explanation because a passing budget should not conceal an avoidable regression.

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

These are synthetic observations from one run, not claims about every visitor. The scheduled workflow retains `production-performance.json` artifacts for 30 days so changes can be compared under the same methodology.

The Phase 13 route expansion identified a 1.77 MB desktop Mission Archive transfer caused by all ten full-resolution card images entering the browser's lazy-load threshold. Archive cards now use dedicated 720-pixel derivatives with a 400 kB aggregate build budget, while mission detail records retain their larger source images. Card URLs are assigned only when an IntersectionObserver places them within 300 pixels of the viewport, avoiding browser-specific native lazy-load distances that previously requested several below-fold rows during the initial desktop visit. The production audit enforces a 1.2 MB same-origin transfer ceiling per scenario. Browser transfer measurements are useful regression signals under consistent conditions, not a replacement for real-user Speed Insights data.

The Phase 10 portfolio baseline records that Mission Archive work as a reduction from approximately 1.77 MB to 0.86 MB on the audited desktop route, with zero measured layout shift. These values are reproducible evidence from the synthetic workflow, not a guarantee for every connection or device.

The Phase 5 public-release audit on 2026-08-24 passed all eight scenarios with
zero CLS, no same-origin console/resource/page failures, and no horizontal
overflow. Warm-route TTFB ranged from 33.3 to 58.3 ms; FCP ranged from 88 to 264
ms; and same-origin transfer ranged from 663.7 to 980.4 kB. The companion route
check observed health at 989 ms, archive APOD at 698 ms, media search at 1,000
ms, and cached SPA rewrites at 35–45 ms. These are one synthetic run retained as
release evidence, not an uptime or visitor-performance guarantee.

## Optimization workflow

1. Identify the affected route and metric in Speed Insights.
2. Reproduce with browser performance tooling under a representative mobile viewport and throttled network.
3. Locate the responsible image, script, layout shift, or interaction.
4. Make the smallest targeted change.
5. Run the quality gates and bundle budget.
6. Compare production results after the next deployment has accumulated a useful sample.

The dashboard APOD media already reserves layout space, requests its visible image eagerly with high fetch priority, uses responsive candidates when NASA provides an HD URL, and keeps other route modules code-split.
