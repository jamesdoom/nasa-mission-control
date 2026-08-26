# Changelog

All notable changes are documented here. This project follows [Semantic Versioning](https://semver.org/) and groups entries using Keep a Changelog conventions.

## [Unreleased]

### Added

- Add accessible mission and story evidence paths plus direct handoffs from reviewed content into the matching guided-learning tracks.
- Add deterministic visual baselines and overflow checks across mobile, tablet, laptop, large-display, and 200%-zoom-equivalent layouts.
- Add an owned monthly editorial register, measurable trivia/clarity/citation/freshness targets, and an evidence-scored existing-content backlog.
- Add release and scheduled audits for overdue reviews, missing citations, duplicate trivia, stale scoring, readability, coverage, and broken or unreachable source links.
- Add consistent freshness, interpretation, limitation, and official-source guidance to every existing live-data journey.
- Preserve and announce explicitly stale NASA fallbacks when current upstream data is unavailable.
- Add source-reviewed instrument, result, continuing-status, evidence-caption, terminology, reflection, and completion content across every existing mission, science story, and learning track.
- Add exact educational-enrichment coverage tests so new or renamed records cannot silently omit the Phase 3 content standard.
- Expand Space Trivia from 12 to 64 reviewed questions while retaining the existing four channels and three difficulty levels.
- Add visible source-review dates and integrity coverage for duplicate prompts, answer-position bias, readability, stable wording, category balance, and official NASA citations.
- Phase 1 content inventory and quality baseline covering every existing editorial area, ownership, risk priority, review status, dated-source standards, and evidence vocabulary.
- A release-gated content inventory check and an expanded monthly editorial review prompt.

- Add sanitized DONKI, EPIC, and NASA Media contract fixtures with actionable required-field schema-drift mutations for every NASA upstream.
- Add daily, privacy-conscious reliability evidence with rolling 30-day route, cache, stale fallback, validation, upstream-category, and latency summaries.
- Add a de-identified repeat-session learning and accessibility research protocol, measurable comprehension rubric, and assistive-technology session matrix.
- Add rolling compressed-asset trend evidence and an accountable five-domain monthly product review.

### Changed

- Standardize mission objectives, curated results, status notes, story evidence captions, definitions, sources, and long-form reading measures.
- Standardize section rhythm, page headings, filters, source/evidence panels, tables, and async states with shared responsive design tokens.
- Clarify source-specific loading and empty states, catalog-versus-observed asteroid approaches, and observed DONKI events versus modeled analysis fields.
- Expand learning completion summaries and educator print sheets with semantic evidence status, delayed-retrieval prompts, source observation space, and explicit limits on mastery claims.
- Replace the general client query dependency with a bounded product-specific cache, recovering 10.3 kB gzip while preserving retries, refetch, freshness, placeholder data, and timestamps.

### Fixed

- Prevent automated TypeScript major upgrades from being grouped with tooling that does not yet support them, and pin deployment builds to Node.js 22.
- Reduce transient production-journey alerts with bounded retries, scoped semantic locators, per-attempt diagnostics, and screenshots after repeated failures.
- Add an accessible Continue reading control to reveal complete APOD explanations without leaving the current page.

### Planned

- Priorities are selected through the evidence review in `docs/improvement-backlog.md`.

## [1.0.0] - 2026-08-24

### Added

- Accessible NASA instruments for APOD, NeoWs, DONKI, EPIC, GIBS, and the NASA Image and Video Library.
- Curated mission archive, science stories, guided investigations, learning tracks, trivia, comparisons, and accessible scientific analysis.
- Browser-local Flight Log personalization, backup, learning progress, and offline curated shell.
- Privacy-conscious production checks, performance budgets, client-failure reporting, upstream telemetry, circuit breakers, stale fallback, contract fixtures, and recovery drills.
- Public release, feedback, accessibility-reporting, operational-status, and continuous-improvement workflows.
- Reproducible clean-install preflight, release-workflow contract checks, bounded dependency updates, and full tagged-release quality gates.

### Security

- NASA credentials remain server-only; upstream payloads are validated and normalized before reaching the client.

[Unreleased]: https://github.com/jamesdoom/nasa-mission-control/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/jamesdoom/nasa-mission-control/releases/tag/v1.0.0
