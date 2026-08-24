# Changelog

All notable changes are documented here. This project follows [Semantic Versioning](https://semver.org/) and groups entries using Keep a Changelog conventions.

## [Unreleased]

### Fixed

- Prevent automated TypeScript major upgrades from being grouped with tooling that does not yet support them, and pin deployment builds to Node.js 22.

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
