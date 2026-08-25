# Accessibility status

NASA Mission Control targets WCAG 2.2 AA patterns but does not claim third-party
certification or universal conformance.

## Verified coverage

- semantic headings, landmarks, labels, status messages, and visible focus;
- keyboard operation for navigation, filters, dialogs, maps, comparisons, and
  Flight Log organization;
- responsive reflow at 320 and 390 pixels and browser zoom checks;
- reduced-motion, forced-colors/high-contrast, and coarse-pointer behavior;
- automated axe checks across 16 representative application states;
- Chromium end-to-end journeys and manual screen-reader scripts documented in
  the Phase 1 usability evidence.
- Learning-specific keyboard, 320-pixel reflow, forced-colors, reduced-motion,
  and print-media checks documented in the Phase 4 research protocol.

## Known limits

Automated tests cannot prove that every assistive-technology combination is
barrier-free. The Phase 4 maintainer accepted the tested experience, but no
NVDA/Firefox or VoiceOver/Safari session notes were supplied. Automated semantic
coverage is not reported as a substitute, and that matrix remains part of the
next research cycle. NASA-provided media, captions, descriptions, embeds, and external
source pages can vary in accessibility. Dense scientific tables may require
horizontal scrolling inside their labeled region on narrow screens even when
the page itself reflows.

Accessibility regressions should be reported through the repository issue
tracker with the route, browser, assistive technology, expected result, and
reproduction steps. Do not include private Flight Log content in a report.

Use the dedicated [accessibility report](https://github.com/jamesdoom/nasa-mission-control/issues/new?template=accessibility.yml). The public workflow, ownership, and triage targets are documented in [continuous-improvement.md](continuous-improvement.md).
