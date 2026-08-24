# Search and discovery intelligence — Phase 1

## Delivered

- Cross-record filters for destination, mission era, evidence type, and scientific topic are encoded in the search URL.
- Related records are ranked only by shared, versioned metadata. Every suggestion displays its destination, evidence, or topic reason; visitor behavior is not collected.
- Command search retains at most five validated recent queries in this browser, offers quick suggestions, and previews the keyboard-active result.
- Investigation workspaces combine up to six missions, observation instruments, media archives, guided paths, and science stories. Record IDs live in the URL for sharing and resuming.

## Before and after

Previously, users had to know a record name, search one source at a time, and open records in separate tabs. Search now narrows heterogeneous records with four facets, exposes explainable continuations, and carries a multi-record evidence board in one shareable URL.

## Privacy and limits

Recent command queries stay in local storage and are never uploaded. Recommendations do not use clicks, profiles, or telemetry. NASA media results remain live query results; the workspace links the stable NASA Media Library instrument because upstream search ranks can change.

## Verification

Strict types, lint, unit/accessibility suites, production build, and Chromium smoke tests cover the release. Responsive controls use 44-pixel targets, collapse to one column at 420 pixels, and retain native keyboard-operable form controls.
