# Motion and interaction choreography — Phase 4

Reviewed 2026-08-26. Owner: frontend maintainer.

## Choreography system

The interface now uses four shared durations—100, 160, 240, and 360 milliseconds—and three easing curves for immediate feedback, standard state changes, deceleration, and emphasized movement. Route arrivals, viewport section arrivals, async panels, cards, buttons, controls, and image depth reuse that vocabulary instead of introducing route-specific timing.

The full navigation header is intentionally sticky. It remains 76 pixels tall on desktop and 66 pixels at the mobile breakpoint, retains its translucent reading surface, and keeps the navigation content attached to its background. In-page anchors reserve space for the header so linked headings are not obscured.

## Access and performance boundaries

- Section content begins at 92% opacity and moves only 10 pixels, so it remains readable and available while the short reveal completes. A mutation observer covers lazy route content, and a single intersection observer stops observing each section after its first reveal.
- Page and section movement uses opacity and transforms without changing layout dimensions. Sticky navigation has a fixed block size, and loading transitions do not reserve new space after content arrives.
- Hover lift is limited to devices with a precise pointer. Touch and coarse-pointer devices receive static cards and buttons while retaining active, focus, and selected feedback.
- Keyboard focus keeps the existing visible outline and adds matching card depth through `:focus-within`.
- Reduced-motion mode removes section animation and transition entirely, collapses remaining legacy motion to the established static fallback, and restores full opacity and a zero transform immediately.
- If intersection observation is unavailable, sections are marked revealed rather than hidden or delayed.

## Verification evidence

Component coverage verifies the no-observer fallback. Browser coverage verifies the header at scroll position on desktop, responsive containment, keyboard-visible navigation, and an animation-free reduced-motion section state. A live local-browser review confirmed the header remains at viewport top with its blur surface intact at both desktop and mobile widths and that the mobile page has no horizontal overflow.

The production build passes at 184.9/190 kB JavaScript gzip and 25.4/26 kB CSS gzip. The choreography adds no imagery or runtime dependency. These technical checks do not replace manual assistive-technology testing on every browser and device combination.
