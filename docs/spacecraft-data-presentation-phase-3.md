# Spacecraft-inspired data presentation — Phase 3

Reviewed 2026-08-26. Owner: frontend maintainer.

## Shared instrument language

APOD, NeoWs asteroid encounters, DONKI space weather, EPIC Earth imagery, and NASA Media now inherit one console system for controls, analysis panels, charts, accessible tables, provenance, and asynchronous states. Each route exposes a stable `data-instrument` identity and a distinct signal pair:

| Instrument | Primary signal | Reading cue          |
| ---------- | -------------- | -------------------- |
| APOD       | violet         | deep-sky observation |
| NeoWs      | amber          | encounter caution    |
| DONKI      | magenta        | solar activity       |
| EPIC       | green-cyan     | Earth observation    |
| NASA Media | blue           | archive retrieval    |

These colors identify instruments; they do not replace meaning. Live status uses the current instrument signal, stale fallbacks always use amber, and unavailable states always use red. Observed, modeled, calculated, and curated badges retain their evidence meanings.

## Status and accessibility

Freshness text continues to name the NASA source, deterministic UTC retrieval time, validation behavior, observation/publication distinction, and stale limitation. Markup now exposes live versus stale freshness and refreshing activity independently of color. Loading animation is hidden from assistive technology, and all activity motion inherits the global reduced-motion override. Tables remain semantic and horizontally contained at narrow widths, while charts retain their adjacent accessible tables.

## Evidence

The deterministic browser suite verifies all five instrument identities, signal tokens, 320-pixel and desktop containment, loading and error recovery, stale provenance, and reduced-motion behavior. Five reviewed control-surface captures are retained in `docs/screenshots/instrument-*.png`; existing loading, error, and stale screenshots remain part of the accepted baseline.

The production build passes the compressed asset budget at 184.6/190 kB total JavaScript and 24.8/26 kB CSS. Automated checks are technical evidence, not a claim that every assistive-technology combination has been manually tested.
