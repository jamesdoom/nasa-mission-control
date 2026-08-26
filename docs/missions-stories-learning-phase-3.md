# Missions, stories, and learning content — phase 3

Completed 2026-08-26. This phase deepens existing educational material without adding a category, route, or product feature.

## Editorial outcome

- All 10 Mission Archive records now pair objectives and milestones with three representative instruments, concise instrument purposes, two result statements, a plainly dated source review, and an honest current or continuing-status note.
- All three science stories now include one evidence caption per chapter, a bounded synthesis, and definitions for the scientific terms most likely to be misunderstood.
- All three learning tracks now add a second evidence-focused reflection prompt, a track-specific completion synthesis, carried-forward terminology, and an explicit source-review date.
- Repeated definitions use a shared glossary record so “habitability,” “heliopause,” “corona,” “spectroscopy,” “redshift,” and “magnetosphere” retain the same meaning across missions, stories, and learning.

## Source and status review

Claims were reviewed against the official NASA sources already attached to each mission and story on 2026-08-26. Current-status language is deliberately bounded. In particular, NASA’s Juno page labels the mission active while also retaining an older September 2025 scheduled end; the local record reports that discrepancy and does not infer an unannounced mission end. Voyager’s note reflects NASA’s April 2026 report that two science instruments remained operating after a power-saving shutdown.

## Reproducible checks

`educationalEnrichment.test.ts` requires exact coverage for every mission, story, and learning track. It also requires three instruments and two results per mission, one caption per story chapter, substantive conclusions and reflection prompts, terminology coverage, and the current review date. The normal strict type, lint, test, build, end-to-end, offline, and compressed-asset gates remain release-blocking.

The production build passes the unchanged 184 kB aggregate JavaScript budget at 181.5 kB gzip. The 3.6 kB enrichment chunk is lazy-loaded by the relevant educational routes and does not increase the main entry, but aggregate headroom is now 2.5 kB; the performance ledger records static-asset extraction as the constraint on further content growth.

This phase does not claim that a valid NASA link proves an interpretation or that completing a track proves mastery. Human source review and the documented learning-research limits still apply.
