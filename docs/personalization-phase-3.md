# Personalization phase 3 evidence

Phase 3 expands the browser-local Flight Log without adding accounts, tracking,
or a remote database. Notes, tags, custom collections, saved filter views, and
mission-comparison bookmarks remain on the user’s device and are included only
when the user explicitly exports a backup.

## Local-first data contract

The `mission-control:flight-log-personalization:v1` record has a versioned,
runtime-validated shape:

- annotations are keyed by stable `<record-kind>:<record-id>` identifiers and
  contain a bounded note, up to five bounded tags, an optional custom
  collection, and an ISO `updatedAt` value;
- saved views store a display name and the existing URL query string, keeping
  filter state portable and inspectable;
- comparison bookmarks store a display name and an allowlisted
  `/missions/compare?...` path;
- annotations are capped at 100 records, views at 12, and comparisons at 12.

Malformed, oversized, or unsupported values are ignored at the read boundary.
The application does not infer scientific facts, interests, or rankings from
personal notes and does not send them to telemetry.

## Continuation and offline behavior

Continuation suggestions are derived entirely from recently viewed and saved
records already available in the browser. They are deterministic navigation
prompts, not behavioral profiling. Because personalization is local storage and
curated routes are part of the installable shell, organization remains usable
offline; live NASA data still requires the network and is never service-worker
cached.

## Backup safety

Import is a staged operation. The UI first reports the backup date, supported
record count, and how many supported records already exist locally. Nothing is
written until the user chooses:

- **Merge:** combine arrays and objects while keeping the local value when the
  same field conflicts.
- **Replace:** replace every supported Flight Log record represented by the
  backup.
- **Cancel:** leave all browser data untouched.

Backups remain size-limited, version-checked, key-whitelisted JSON processed
entirely on-device. Unknown keys cannot be imported.

## Future synchronization boundary

No synchronization is implemented in this phase. A future opt-in account sync
must preserve the local schema semantics and add a server-owned contract with:

1. stable user-scoped record IDs and explicit schema versions;
2. per-record update timestamps plus tombstones for deletions;
3. conflict previews rather than silent replacement, using local-wins as the
   safe default unless the user selects otherwise;
4. encryption in transit and at rest, export/deletion controls, and a clear
   retention policy;
5. an offline mutation queue that never blocks local reads or edits.

This boundary prevents today’s local-only language from implying an account or
cross-device capability that does not exist.

## Verification evidence

- Unit tests cover validation, persistence, local-conflict merge behavior, and
  staged backup summaries.
- Automated accessibility coverage exercises a populated Flight Log and mission
  comparison.
- Browser smoke coverage saves an annotated APOD, finds it by a custom
  collection, saves its current view, persists a comparison bookmark across a
  reload, and checks the comparison at a 390-pixel viewport.
- The standard type, lint, unit, accessibility, build, offline, performance, and
  end-to-end gates remain required before release.

The verified 390-pixel Flight Log layout is retained as
[mobile visual evidence](screenshots/phase-3-flight-log-mobile.png). The browser
reported matching 390-pixel document and viewport widths with no page or console
errors after the responsive saved-view layout correction.
