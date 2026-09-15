# Streamlined home page and trivia

Completed interface update. Participant validation remains separate and pending.

The dashboard removes a repeated daily-image label and collapses its data-label guide into an accessible native disclosure. Trivia uses a smaller introduction, tighter spacing, plain Difficulty and Topic labels, and places source details after the question area. All source content and existing controls remain available.

Asteroid cards now show Save to Flight Log or Saved (Remove), matching APOD's visible control and the Flight Log naming already used by mission and media detail pages. Space Weather failures explain that records could not be loaded, suggest retrying or another date range, and distinguish missing data from no events. This changes presentation only; it does not fix or diagnose upstream reliability.

Types, lint, unit/component/accessibility tests, and production build passed. Browser coverage passed 41 tests initially with one production-only skip; the remaining test encountered a screenshot file-write error and passed on serial retry. The earlier full-page screenshot helper correction and refreshed captures are included. React review confirms semantic controls, existing pressed states, and unchanged data-fetching behavior.

See refreshed [dashboard](screenshots/dashboard.png), [trivia](screenshots/space-trivia.png), and [asteroid cards](screenshots/asteroid-watch.png). These captures use deterministic test data. Participant sessions have not been conducted or represented as complete; use the [prepared guide](appearance-validation-phase-5.md) for the remaining research.
