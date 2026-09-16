# Launch polish roadmap

This cycle refines existing features before promoting the site.

1. **Implemented: stronger first impression.** Following visual review, the homepage now uses a single column. The introduction and its decorative animation are removed; station time, briefing data, and briefing sources sit above the NASA selection. The daily image is the primary focal point, with existing archive, save, source, error, and video behavior retained. Participant confirmation of first-impression clarity is pending phase 5.
2. **Implemented: page composition.** Standardized primary heading sizes and introductory spacing across APOD, Mission Archive, Flight Log, Trivia, Earth, Media Library, Space Weather, and Asteroid Watch. Media Library uses the same outer width as adjacent sections and left-aligns its description with search controls. Mission and trivia descriptions sit beneath their titles; Earth and weather controls follow more compact introductions. APOD images retain their full framing on desktop. See [phase 2 evidence](page-composition.md).
3. **Implemented: interaction polish.** APOD stories render in full without an expansion control. Filter selections share a stronger visual marker, save controls have explicit keyboard focus outlines, and trivia answers include written correctness labels. Trivia source and continuation links have clear spacing. See [phase 3 verification](interaction-polish.md).
4. **Implemented: incoming-traffic readiness.** Added main-route sharing metadata and stable homepage failure recovery, audited direct entry and slow mobile behavior, and preserved asset budgets. Slow homepage LCP and real-user percentile review remain follow-ups. See [phase 4 evidence and limits](traffic-readiness.md).
5. **In progress: participant validation and launch review.** Recruitment is pending. Participant materials and the launch checklist are ready; current technical checks and refreshed screenshots pass. Actual sessions, resulting fixes/retests, and the slow-homepage follow-up remain open. See the [launch review](launch-review.md).

## Phase 1 verification

The user-requested single-column follow-up supersedes the earlier side-by-side layout. All three status items remain visible at narrow widths. The daily selection is now the page's primary heading, and the removed hero's observer and animation test were retired.

Typecheck, lint, unit/component/accessibility tests, production build, and the production browser suite passed. Existing compressed asset budgets remain satisfied. The delayed-font/data fixture recorded zero CLS at 390px and 1440px after reserving the image frame. These are controlled measurements, not field-performance claims.

The [previous desktop layout](screenshots/loading-stability/desktop.png) shows the introduction above the picture. Updated deterministic captures show the single-column desktop and mobile composition; content fixtures differ, so these are layout evidence rather than image-quality comparisons.

![Updated desktop homepage](screenshots/launch-polish/desktop.png)

![Updated mobile homepage](screenshots/launch-polish/mobile.png)

No participant sessions were conducted during implementation. The existing [session guide](appearance-validation-phase-5.md) remains applicable; automated checks do not establish that unfamiliar visitors understand the site.
