# Performance: mobile rendering

Completed phase 2. Mobile dashboard decoration reuses the existing 960px background already selected by the page body. Hero animations pause when the hero is offscreen or the document is hidden and resume when visible. Reduced-motion rules still apply; scientific media and desktop image selection are unchanged.

## Controlled before/after probe

Chromium, 390 x 844 CSS pixels, device scale factor 2, a fresh context, local production preview, service workers blocked to isolate page requests, and mocked unavailable API responses:

| Measurement                                  | Before         | After      |
| -------------------------------------------- | -------------- | ---------- |
| Requested background variants                | 960px + 1600px | 960px only |
| Additional 1600px image payload              | 324,262 bytes  | 0 bytes    |
| Running hero animations after scrolling away | 3              | 0          |

This removes about 316.7 KiB from this cold mobile page's requested image payload. It is not a measured LCP, battery-life, or CPU-percentage improvement, and benefits vary with viewport, density, and cache state. The full installed asset set remains unchanged.

Raw observations: [before](performance-render-before.json), [after](performance-render-after.json). [Mobile visual check](screenshots/performance/mobile-background.png) confirms the decorative background remains legible; the capture intentionally uses unavailable mock data.

Types, lint, unit/component/accessibility tests, production build, asset budgets, and offline-shell checks passed. All 45 production browser tests passed, including pausing offscreen animation and resuming on return, repeat-visit query reuse, first offline installation, responsive/keyboard, and reduced-motion flows. Final total gzip JavaScript is 168.0 KiB and CSS is 23.4 KiB, within existing budgets.

The image audit found no justification for reducing scientific image quality in this update. Larger desktop backgrounds remain available. Further broad CSS/blur changes should follow device profiling rather than assumed speedups.
