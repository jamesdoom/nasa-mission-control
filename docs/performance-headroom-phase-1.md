# Performance headroom phase 1

Date: 2026-09-08. Owner: Frontend maintainer.

The phase reduces shipped JavaScript and eliminates an unnecessary first-visit
reload while preserving the existing interface and asset ceilings.

## Changes and measurements

| Production asset         | Before (KiB gzip) | After (KiB gzip) | Existing ceiling |
| ------------------------ | ----------------: | ---------------: | ---------------: |
| All JavaScript           |             184.9 |            181.6 |              190 |
| Largest JavaScript chunk |             100.6 |             97.6 |              110 |
| All CSS                  |              25.4 |             25.4 |               26 |

Measurements use `npm run build` followed by `npm run performance:budget` on
Node.js 22. The budget script labels binary KiB as kB. Total JavaScript headroom
increases from 5.1 to 8.4 KiB. CSS falls from 26,043 to 26,032 gzip bytes;
that is a maintenance cleanup, not a substantial CSS transfer improvement.
Images and fonts are unchanged at 3,320.5 and 68.5 KiB respectively.

- Terser is a build-only dependency. Default safe compression is enabled through
  Vite; no unsafe transforms, property mangling, or browser-target changes are used.
- Fourteen adjacent rules with identical declarations are merged into selector
  lists within their original media/cascade contexts. Responsive, reduced-motion,
  and print behavior remains equivalent.
- The initial service-worker controller change no longer reloads the current
  page. Subsequent controller replacements retain the update reload behavior.
  This avoids interrupting input and repeating page initialization and requests.
- The entry route remains eager and other routes remain lazy. Trivia is already
  a validated static payload; mission/story/learning enrichment is already a lazy
  shared chunk. This phase does not introduce another content-fetch lifecycle.

## Verification

The existing browser suite can now run against Vite's production preview using
`PLAYWRIGHT_PREVIEW=true` after a build. CI and release workflows use this mode,
with service workers enabled. A new test verifies first installation reaches
offline readiness without a second document request or losing the selected date.
Color assertions resolve the CSS value through the browser so equivalent
minified decimal syntax does not produce false failures.

Passed: type checking, ESLint, unit/component/accessibility tests,
all 35 production browser tests, formatting, and `release:preflight` (including clean
lockfile verification, resilience, editorial/mission review, build, asset budgets,
and offline verification). Responsive coverage includes 320, 640, 768, 1366, and
1920 pixel widths plus keyboard, forced colors, and reduced motion.

## Limits and follow-up

These are local production-build measurements, not measured changes to real-user
Core Web Vitals or a completed operating window. CSS headroom remains narrow;
further cosmetic work must reuse existing styles. The extra JavaScript build
optimization increases build work but adds no browser dependency. No upstream
NASA integration or source content changed.
