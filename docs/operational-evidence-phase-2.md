# Operational evidence and journey stability — Phase 2

## Evidence reviewed

The production artifact captured on 2026-08-25 passed all eight desktop and
mobile performance scenarios. TTFB ranged from 7.2 to 33.3 ms, FCP from 60 to
276 ms, heading readiness from 189.7 to 565.8 ms, and same-origin transfer from
674.3 to 991 kB. Every scenario reported zero CLS, no horizontal overflow, and
no application-controlled console, page, or resource failures.

The companion journey report failed only while clicking the Apollo 11 personal
details disclosure in the Flight Log. The click reached Playwright's generic
30-second timeout and the report discarded the locator call log. A direct
reproduction against the same production URL passed the complete journey,
including reload persistence, in 1.7 seconds. This is treated as a transient
interaction failure rather than evidence of lost browser data.

## Refinement

- Each production journey receives two bounded attempts before it alerts.
- Attempt duration, URL, and a concise Playwright call log are retained in JSON.
- A repeated failure captures a full-page screenshot in the same private
  workflow artifact.
- The Flight Log interaction is scoped to the saved Apollo 11 record and its
  semantic `summary`, with a 10-second action threshold rather than a generic
  page-wide text match and 30-second wait.
- Server interactions remain read-only. Continuity writes use only a disposable
  Playwright browser profile and synthetic local records.

## Interpretation

A first-attempt failure followed by success is recorded as diagnostic evidence
but does not page maintainers. Two failed attempts remain a workflow failure.
This reduces noisy email alerts without weakening the critical-journey gate or
using forced clicks that could conceal an inaccessible interface.
