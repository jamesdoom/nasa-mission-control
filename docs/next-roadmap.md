# Evidence-driven next roadmap

This five-phase sequence was proposed on 2026-09-08. Phases 1, 3, and 4 are implemented;
phase 2 awaits participant recruitment. Phase 5 maintenance is in progress, with the complete operating window still pending. Accessibility, privacy, security, and data-integrity
barriers override the sequence.

1. **Complete — Recover performance headroom:** reduce JavaScript from 184.9 to 181.6 KiB gzip, consolidate adjacent CSS rules, and eliminate first-install offline reloads. Existing ceilings remain 190 KiB JavaScript and 26 KiB CSS. See [phase evidence](performance-headroom-phase-1.md); CSS still needs careful reuse.
2. **Validate and simplify user journeys:** run three real, de-identified sessions spanning first visit, evidence, saving, and learning, including a screen-reader session. Fix and retest observed blockers; keep participant evidence separate from maintainer reviews.
3. **Complete — Make dashboard status accurate and useful:** APOD and NeoWs independently drive loading, available, stale, unavailable, and offline indicators, with partial-failure guidance and retry. Browser connectivity is labeled separately from source availability. See [phase evidence](dashboard-status-phase-3.md).
4. **Complete — Improve exploration and learning continuity:** refine existing mission, observation, guided-path, trivia, and Flight Log handoffs so users can save and resume with context. See [phase evidence](exploration-continuity-phase-4.md).
5. **Strengthen reliability and scientific maintenance:** review a complete 30-day operating window, address recurring failures, and refresh official NASA contracts, time-sensitive content, and documentation. See [current review and remaining evidence](reliability-scientific-maintenance-phase-5.md).

Each item needs an evidence link, owner, acceptance criterion, and updated score before implementation. `npm run review:cycle` protects the owned register and score arithmetic. Re-score after every monthly review and release; document rejected ideas as well as selected work.
