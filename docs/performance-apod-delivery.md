# Performance phase 4: APOD image delivery

The shared daily-picture renderer now uses the normalized `mediaUrl` for its inline image. The existing high-resolution link remains available in both the dashboard panel and APOD page. Eager loading and priority on the APOD page, lazy loading on the dashboard, image descriptions, and video playback are unchanged.

Previously, the renderer invented `1200w` and `2400w` source descriptors for the standard and HD URLs. Our API contract supplies no image dimensions. Width descriptors must match the image's intrinsic width, as documented by [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#srcset). The [official NASA APOD repository](https://github.com/nasa/apod-api) describes `hdurl` as a full-size image when available; it does not guarantee a 2,400-pixel width. Sources checked September 15, 2026. This phase changes no upstream endpoints, access requirements, or server normalization.

## Controlled evidence

Fresh Chromium contexts, service workers blocked, local production build, mocked APOD response, and existing local Curiosity images:

| Viewport / pixel density | Before image bytes | After image bytes | HD requested automatically after |
| ------------------------ | -----------------: | ----------------: | -------------------------------- |
| 430 x 932 / 3            |            174,769 |            76,671 | No                               |
| 1440 x 932 / 2           |            174,769 |            76,671 | No                               |

This fixture avoids 98,098 bytes (95.8 KiB), or 56.1%, per initial image load. These are file-body bytes for requested fixture images, excluding HTTP overhead, not a measurement of live NASA imagery or loading time. Actual savings depend on each record; URLs may even identify the same resource. Standard previews may look less sharp on large or high-density displays; the full-resolution image remains one link away.

Raw results: [before](apod-delivery-before.json), [after](apod-delivery-after.json). Reproduce after building:

```sh
npm run build
node scripts/measure-apod-delivery.mjs artifacts/apod-delivery.json
```

The script also captures mobile and desktop screenshots for inspection. The browser regression verifies the actual selected source, absence of an automatic HD request, and keyboard activation of the HD link.

## Verification

Typecheck, lint, unit/component/accessibility tests, production build, all 47 production browser tests, compressed asset budgets, offline-shell checks, and layout-shift metric tests pass. Mobile and desktop screenshots were inspected. No new dependencies or features were added.
