# Performance evidence

NASA Mission Control uses two complementary forms of performance evidence:

- Vercel Speed Insights collects route-level Core Web Vitals from real production visits.
- A deterministic CI check measures the compressed JavaScript and CSS produced by Vite.

No general visitor analytics, advertising identifiers, accounts, or custom tracking events are included.

## Reproduce the bundle evidence

```sh
npm run build
npm run performance:budget
```

The check reports gzip sizes and fails when any limit is exceeded:

| Evidence                 |      Budget |
| ------------------------ | ----------: |
| Largest JavaScript asset | 120 kB gzip |
| All JavaScript assets    | 160 kB gzip |
| All CSS assets           |  16 kB gzip |

The limits leave a small, deliberate margin above the verified Phase 7 build. Raising one requires an explanation because a passing budget should not conceal an avoidable regression.

## Interpret real-user results

Use the Vercel project’s Speed Insights view after production has received enough traffic. Evaluate routes independently and use the standard “good” thresholds as goals:

- LCP below 2.5 seconds
- INP below 200 milliseconds
- CLS below 0.1

Small samples are directional rather than conclusive. Before changing code, confirm that a weak metric persists across multiple visits and is not isolated to a single device or network class.

## Optimization workflow

1. Identify the affected route and metric in Speed Insights.
2. Reproduce with browser performance tooling under a representative mobile viewport and throttled network.
3. Locate the responsible image, script, layout shift, or interaction.
4. Make the smallest targeted change.
5. Run the quality gates and bundle budget.
6. Compare production results after the next deployment has accumulated a useful sample.

The dashboard APOD media already reserves layout space, requests its visible image eagerly with high fetch priority, uses responsive candidates when NASA provides an HD URL, and keeps other route modules code-split.
