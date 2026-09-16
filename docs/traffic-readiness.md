# Incoming-traffic readiness

Phase 4 audited the deployed app on September 16, 2026 and refined existing entry and recovery behavior.

## Entry pages and sharing

The client build generates HTML titles, descriptions, canonical links, Open Graph tags, and Twitter cards for the twelve main routes. Vercel serves these entry documents before the SPA fallback. Browser navigation updates metadata from the same description catalog. The preview image is existing Webb imagery representing the app, not a claim about today's APOD. Descriptions identify the app as independent, distinguish research from forecasts, and explain browser-local saved records. Flight Log and Investigation Workspace request `noindex,follow`.

Query strings still carry selected dates and filters when visitors open links; canonical URLs consolidate them to their main page. Record-specific and story deep links retain the general app preview in initial HTML, then receive category metadata in the browser. They do not advertise a record-specific social image or description. Sharing a Flight Log URL does not transfer saved data. Social services may cache older previews; tags do not guarantee an identical card on every service.

This is metadata generation, not content server rendering. The app still requires JavaScript. Vercel's explicit entry rewrites are verified against built documents; local Vite preview uses the SPA fallback for friendly paths. See [Vercel rewrite behavior](https://vercel.com/docs/routing/rewrites).

## Slow connections and unavailable NASA data

The deployed read-only smoke check passed, including direct SPA links. One APOD request returned 503 after about 10.2 seconds before a retry succeeded; this is evidence of intermittent availability, not a clean upstream reliability claim. No NASA integration or caching policy changed.

A separate fresh-browser lab probe used a 390×844 viewport, DPR 2, 150 ms network latency, 1.6 Mbps download, fourfold CPU slowdown, reduced motion, and a 12-second observation after the heading. The deployed baseline recorded:

| Scenario                         | Provisional LCP |   CLS | Outcome                              |
| -------------------------------- | --------------: | ----: | ------------------------------------ |
| Homepage                         |         4.320 s |     0 | Loaded within the observation window |
| Dated APOD link                  |         2.100 s |     0 | Loaded within the observation window |
| Homepage with simulated API 503s |         1.820 s | 0.237 | Mission Archive remained reachable   |

The error panel had collapsed the space reserved for the daily image. The revised layout preserves that space and places mission-history and trivia links beside the error. The local production build measured **CLS 0**, provisional LCP 2.272 s, no pending loading panels, and successful navigation to Apollo 11 in Mission Archive under the same browser throttling. Local and deployed timings are not directly comparable. Failure responses are injected only into the test browser; production APIs are not disabled. The retained space trades some blank area for stability, with useful alternatives visible beside the failure.

Raw evidence: [standard live baseline](evidence/traffic-readiness/live-baseline.json), [slow live baseline](evidence/traffic-readiness/slow-baseline.json), and [local failure correction](evidence/traffic-readiness/failure-after.json).

## Performance interpretation and remaining launch work

The seven existing unthrottled production scenarios passed their stability and resource budgets. They are controlled observations, not a representative user sample. The slow homepage's 4.320-second LCP is outside the good target and remains a performance follow-up; one run does not establish a percentile or isolate network, image, or API contribution.

[Core Web Vitals guidance](https://web.dev/articles/vitals) defines good LCP at 2.5 seconds or less, INP at 200 milliseconds or less, and CLS at 0.1 or less, assessed at the 75th percentile separately for mobile and desktop. These navigation probes do not measure field INP, and no real-user percentile dataset was inspected. Existing Speed Insights instrumentation remains unchanged. Review its mobile/desktop field distribution as incoming traffic supplies sufficient samples; do not label this phase a real-user Core Web Vitals pass. Participant validation and traffic promotion remain phase 5 work.

## Deployed follow-up

The public deployment of `dac0fab` was verified after push. All twelve main routes returned 200 and the matching initial HTML title and social tags; their script hash matched the local production build. [Metadata evidence](evidence/traffic-readiness/deployed-metadata.json).

The repeated throttled production probe measured homepage LCP **7.396 s**, dated APOD LCP **2.160 s**, and simulated-failure LCP **1.972 s**. All three recorded **CLS 0**, no pending images or loading panels at the observation cutoff, and the failure scenario successfully opened Mission Archive. The deployed error-layout correction is confirmed. The homepage timing varied substantially from the baseline and remains outside the good target; this run does not establish whether the difference came from the network, NASA response, image delivery, or application work. It is not evidence of a performance pass. Investigate slow-homepage delivery before a broad traffic campaign. [Deployed slow-run evidence](evidence/traffic-readiness/slow-deployed-after.json).

## Verification and reproduction

Typecheck, lint, 183 unit/component tests (including accessibility checks), the production build, and all 48 browser tests passed. Metadata tests verify navigation replacement, initial HTML without JavaScript, preview asset existence, and routing configuration. Compressed assets remain within the existing budgets; offline-shell checks pass. Mobile failure screenshots were visually inspected. The React review found no new fetch waterfall, dependency, or broad rerender subscription.

After `npm run build`:

```sh
node --test scripts/entry-metadata.test.mjs
npm run performance:budget
npm run offline:verify
node scripts/audit-slow-entry.mjs --local
```

The local probe starts Vite preview itself. `node scripts/audit-slow-entry.mjs` targets the public deployment; `npm run audit:production` and `npm run smoke:production` retain the broader existing checks. Browser probes write screenshots and JSON to `artifacts/`. The local failure probe enforces CLS ≤ 0.1 and confirms usable curated content.
