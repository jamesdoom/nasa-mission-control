# Evidence-led refinement cycle — Phase 5

Reviewed: 2026-08-26

## What was measured

The current technical session exercises the four requested journeys through deterministic browser tasks: first-visit orientation, mission discovery and evidence reading, guided learning with local progress, and live-data interpretation including a stale fallback. All 28 browser journeys pass. The component suite covers 18 representative axe states, while browser checks exercise keyboard operation, 320-pixel reflow, forced colors, reduced motion, and visual baselines.

This is reproducible technical and maintainer evidence, not participant research. No new participant sessions, screen-reader session notes, quotations, or comprehension scores were supplied, so the register records zero rather than inventing results. NVDA/Firefox or VoiceOver/Safari testing and three de-identified comprehension sessions remain prioritized work.

## Repeatable review record

`improvement-cycle.json` is the machine-checked source of truth for:

- six review domains and their accountable owners;
- first-visit, mission, learning, and live-data journey evidence;
- keyboard, screen-reader, zoom/reflow, high-contrast, and reduced-motion status;
- the scored product backlog and its next measurable actions;
- limitations that must remain public until evidence changes them.
- eight owned responsive/state screenshot baselines and their latest accepted review.

`npm run review:cycle` rejects missing owners or evidence files, incomplete journey or accessibility coverage, stale review dates, overdue next reviews, non-contiguous priorities, incorrect score arithmetic, missing actions, and an empty limitations register. It writes a sanitized artifact without participant identifiers.

The monthly workflow now runs that gate alongside citation/content auditing, retains both artifacts for 90 days, and opens one accountable issue covering reliability, route and visual performance, every accessibility mode, the four usability journeys, content, feedback, governance, and post-release backlog scoring. Release preflight runs the same cycle gate.

## Current decisions

- Accessibility barriers, privacy/security defects, and data-integrity failures override numeric backlog scores and cosmetic work.
- The aggregate JavaScript build passes at the 184 kB ceiling with no rounded headroom. Recovering headroom is the first engineering action; the budget was not raised.
- The single retained reliability sample verifies collection but does not justify an uptime claim or threshold change. Review after a complete 30-day window.
- Editorial health currently reports 96 cited trivia questions, 100% citation/clarity coverage, and no audit failures. Monthly review remains necessary because a passing snapshot does not guarantee future accuracy.
- No open structured feedback at the August review is not evidence of satisfaction.

## Session procedure

Use participant codes only and do not collect names, email addresses, IP addresses, recordings, account identifiers, or Flight Log contents. Ask participants to complete the four journeys without coaching, then identify whether one value is observed, modeled, calculated, curated, current, or stale. Record task completion, prompt count, wrong turns, a coarse time band, confidence, accessibility mode, and an optional de-identified note. Aggregate results before publishing them.

For assistive technology, run the same tasks with keyboard only, one screen-reader/browser pairing, 200% and 400% zoom, Windows High Contrast or equivalent, and reduced motion. A task-blocking barrier blocks release until corrected and re-tested. Moderate barriers require an owner and acceptance evidence before cosmetic work.

## Exit evidence

- Owners and evidence paths are enforced by `npm run review:cycle`.
- Automated accessibility, unit/component, browser, visual, reliability, content, build, performance, and offline gates pass.
- Public accessibility, status, service-limitations, performance, continuous-improvement, roadmap, and changelog documents state measured coverage and remaining limits.
- The next roadmap and backlog are re-scored from observed constraints, with participant and 30-day evidence gaps explicitly retained.
