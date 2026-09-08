# Phase 4 — Exploration and learning continuity

## Scope

This phase connects the existing missions, curated stories, live instruments, guided discovery, learning tracks, trivia, and Flight Log. It retains local browser storage and the existing record favorites; it does not introduce accounts or change NASA integrations.

## User journeys

- Guided paths and learning resources carry a return link to the originating path or track step. Related story, mission, media, and observation links preserve that chain. Filter changes retain return context; media detail returns to the actual search and page.
- Save exploration to Flight Log stores the current internal URL, including filters and return context. Resume exploration and learning in Flight Log reopens those views, lists started learning tracks with their next unfinished resource, and offers the latest trivia session. Saved views are capped at 20 and can be removed independently of saved records.
- Learning resource completion, checks, and saved reflections remain compatible with existing progress. Reflection drafts are retained while typing; a draft does not count as a completed reflection. Resume links scroll and focus the relevant learning step, check, or reflection.
- Trivia restores question order, current question, selected answer, score, streak, and completion. Returning to an answered question keeps its choices disabled to prevent duplicate scoring. Selecting another topic starts a new session; the latest session is the one offered in Flight Log. An incompatible question bank starts a new session instead of attaching progress to a different question.
- The existing Flight Log backup includes saved explorations and trivia. Merging keeps a local trivia session intact rather than mixing its question order with another score. Existing backups remain supported.

## Boundaries

These are saved views, not frozen copies of upstream data. Live records can change or become unavailable. The interface explains this at save and resume. Normalized record favorites remain the way to retain supported observation records.

New stored exploration and trivia records are validated with Zod Mini from the existing pinned Zod package, then checked for bounded counts, valid indices, and safe internal paths. External return targets are ignored. Return chains are bounded to 3000 characters; exceptionally long chains retain the immediate resource URL without its older return chain. Browser storage failures do not break navigation; exploration and trivia saves fall back to memory and explicitly state that they last only for the session. Cross-tab exploration changes refresh mounted readers.

## Verification

Maintainer and automated verification only. Phase 2 participant recruitment and the screen-reader usability session remain pending; this work does not claim participant validation.

Passed: strict types, lint, formatting, all workspace tests (145 client and 53 server tests), lockfile validation, production build, unchanged compressed asset budgets, backup compatibility, and all 46 production Playwright scenarios. The final full browser run passed 45 scenarios; the remaining story test passed on focused retest after updating its expected context-bearing URL. No production code changed for that test correction. The final client build measures 189.9 KiB gzip JavaScript against the unchanged 190 KiB limit and 25.5 KiB CSS against 26 KiB. JavaScript headroom is narrow; subsequent features must continue to respect the budget. The Flight Log desktop capture was visually reviewed, and mobile learning/focus and existing 320 px, forced-color, reduced-motion, and responsive checks passed.

New end-to-end coverage follows a guided discovery through Curiosity and filtered media to a saved exploration, reloads Flight Log, resumes the evidence, and returns through the original context. It also covers mobile learning/draft restoration, keyboard focus at the resumed step, trivia restoration without duplicate scoring, and unavailable browser storage.
