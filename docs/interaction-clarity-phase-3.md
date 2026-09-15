# Phase 3: Clarify existing interactions

Completed 2026-09-15. No new features or API changes.

APOD now uses an Archive date label and a View image action instead of Acquire. Its existing heart control includes visible Save to Flight Log and Saved (Remove) text, retains its pressed state, and names the record in its accessible label. Archive date also replaces Observation in the record header to avoid implying the media was captured on that date.

Mission Archive uses Filter missions and All spacecraft types. Its empty state says no missions match the filters and retains Show all missions. Flight Log uses Search and filters, Record type, and Reset search and filters. Its empty-state link now says Browse today's image because opening APOD does not save it. Loading and error copy describes the requested records in plain language; APOD's fallback error suggests retrying or choosing another date.

## Validation

Types, lint, unit/component/accessibility tests, production build, and compressed asset budgets passed. End-to-end smoke coverage passed 41 tests with one production-only test skipped. Existing tests cover save persistence, URL dates, filter reset, loading/error recovery, responsive layouts, and keyboard/forced-color behavior. The APOD component test additionally verifies the visible saved state and remove callback.

Built-page checks at 1440px and 390px verified the APOD save transition with no runtime errors or horizontal overflow. Visual review caught and corrected a separator encoding issue; the corrected label and build were rechecked. React review found no new effects, dependencies, or data-fetching changes. This is maintainer verification, not participant research.

- [Desktop saved state](screenshots/interaction-clarity/apod-1440.png)
- [Mobile saved state](screenshots/interaction-clarity/apod-390.png)

Captures use a mocked APOD record and a local mission image. Mobile notices and navigation remain scheduled for Phase 4.
