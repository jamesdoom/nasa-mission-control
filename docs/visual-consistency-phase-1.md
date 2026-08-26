# Visual consistency and responsive polish — phase 1

Reviewed 2026-08-26. This phase standardizes existing presentation patterns; it adds no product category or content type.

## Audit and changes

The visual audit covered shared page introductions, section headings, evidence and source panels, semantic tables, filters, cards, and loading/error/empty/degraded states. It found good route-level designs but inconsistent vertical rhythm and panel padding, undefined shared `--panel` and `--line-strong` tokens, and no CI-enforced viewport matrix behind the portfolio screenshots.

The shared stylesheet now defines one section rhythm, panel padding, reading width, content line height, strong border, raised-panel background, and minimum control height. Page headings balance without forcing narrow words, section descriptions share measure and leading, tables have consistent cell spacing and bounded horizontal scrolling, and source/state panels use the same visual surface. Mobile sections and headings use a tighter but consistent rhythm.

## Responsive and state evidence

`visual-consistency.spec.ts` checks Mission Archive at 320, 768, 1366, and 1920 CSS pixels plus a 640-pixel viewport representing a 1280-pixel browser at 200% zoom. It fails on document overflow or filters wider than the viewport. Mission evidence is checked at laptop and large-display widths, including a minimum gap before chronology. APOD loading, upstream-error, retry, recovered, and stale-degraded states plus the Mission Archive empty state are exercised at representative narrow widths.

Deterministic screenshot evidence is refreshed through `npm run screenshots:update`:

- `visual-mobile-320-filters.png`
- `visual-tablet-768-filters.png`
- `visual-laptop-1366-mission-evidence.png`
- `visual-large-1920-mission-evidence.png`
- `visual-loading-state.png`
- `visual-error-state.png`
- `visual-empty-state.png`
- `visual-stale-degraded-state.png`

The screenshots make visual review repeatable; layout assertions, accessibility tests, and production budgets remain the automated gates. Screenshot evidence does not replace human inspection at native browser zoom or with assistive technology.
