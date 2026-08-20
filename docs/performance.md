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
| All JavaScript assets    |  162 kB gzip |
| All CSS assets           |   18 kB gzip |
| Mission Archive cards    | 400 kB total |

The limits leave a small, deliberate margin above verified builds. Phase 5 raised the CSS ceiling from 16 to 18 kB to accommodate the responsive Celestial Scale Laboratory controls, logarithmic plot, evidence cards, and reduced-width layouts; its measured addition was about 0.6 kB gzip. Phase 6 raised the aggregate JavaScript ceiling from 160 to 162 kB for the reusable provenance disclosure, freshness guidance, glossary, and route-arrival correction; the largest entry chunk remains independently capped at 120 kB gzip. Raising a limit requires an explanation because a passing budget should not conceal an avoidable regression.

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

The audit warms the production origin once to keep runner DNS and TLS setup from masquerading as application TTFB, then checks the dashboard at desktop and mobile sizes, the About case study, the Mission Archive at desktop and mobile sizes, an Artemis I mission record, and Guided Discovery at desktop and mobile sizes. It records connection-plus-response time separately while budgeting server TTFB, FCP, heading readiness, CLS, and same-origin encoded transfer size. It also fails on non-200 navigation, console or page errors, failed same-origin resources, and horizontal overflow.

The initial Phase 9 baseline was:

| Scenario          |  TTFB |    FCP | LCP snapshot | CLS |
| ----------------- | ----: | -----: | -----------: | --: |
| Dashboard desktop | 40 ms | 436 ms |       436 ms |   0 |
| Dashboard mobile  | 31 ms | 296 ms |       328 ms |   0 |
| About desktop     | 33 ms | 292 ms |       364 ms |   0 |

These are synthetic observations from one run, not claims about every visitor. The scheduled workflow retains `production-performance.json` artifacts for 30 days so changes can be compared under the same methodology.

The Phase 13 route expansion identified a 1.77 MB desktop Mission Archive transfer caused by all ten full-resolution card images entering the browser's lazy-load threshold. Archive cards now use dedicated 720-pixel derivatives with a 400 kB aggregate build budget, while mission detail records retain their larger source images. The production audit enforces a 1.2 MB same-origin transfer ceiling per scenario. Browser transfer measurements are useful regression signals under consistent conditions, not a replacement for real-user Speed Insights data.

## Optimization workflow

1. Identify the affected route and metric in Speed Insights.
2. Reproduce with browser performance tooling under a representative mobile viewport and throttled network.
3. Locate the responsible image, script, layout shift, or interaction.
4. Make the smallest targeted change.
5. Run the quality gates and bundle budget.
6. Compare production results after the next deployment has accumulated a useful sample.

The dashboard APOD media already reserves layout space, requests its visible image eagerly with high fetch priority, uses responsive candidates when NASA provides an HD URL, and keeps other route modules code-split.
