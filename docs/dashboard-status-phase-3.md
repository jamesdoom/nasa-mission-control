# Accurate dashboard briefing — phase 3

Date: 2026-09-08. Owner: Frontend maintainer.

The dashboard previously displayed `NASA // ACTIVE` regardless of whether its
requests succeeded. The shared header also described browser connectivity as
`SYSTEMS NOMINAL`. Both could imply NASA service health without evidence.

## Delivered behavior

The hero shows the combined APOD/NeoWs briefing state. A named, responsive status
region beside the daily image reports both feeds independently and offers a
Refresh briefing button. Its polite, atomic announcement excludes the ticking
UTC clock. The header says Browser online/offline, scoped to browser connectivity.

| Condition                               | Briefing behavior                                                                                                                                                                       |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial requests pending                | Loading; no observation or encounter count is claimed.                                                                                                                                  |
| Both responses available                | Available, explicitly defined as received data rather than a real-time feed or proof of all NASA services being healthy.                                                                |
| One response available, the other fails | Partially available; the failed source remains named and successful content stays usable.                                                                                               |
| Both requests fail                      | Unavailable with a briefing retry action and APOD error details.                                                                                                                        |
| Server sends stale fallback             | Stale data, or Partially available if the other source failed; the affected feed retains its stale label.                                                                               |
| Refresh in progress                     | Refreshing; an existing stale fallback retains its warning while refreshing.                                                                                                            |
| Browser offline                         | Offline overrides the combined state. Loaded records are labeled previously loaded or stale; absent APOD receives reconnect guidance instead of a loading promise. Refresh is disabled. |
| Connectivity returns                    | Existing request outcomes are shown; Refresh briefing requests both feeds again. Connectivity alone does not establish successful recovery.                                             |

The daily briefing now separates source status, the APOD record, and onward
discovery choices. It avoids claiming that an older APOD is today's observation.
Asteroid counts use the response's actual UTC scan range instead of calling a
potentially stale count “the next seven days.” Empty successful scans remain
available and display zero; a failed scan never displays a fabricated zero.

## Verification and boundaries

- Ten status unit cases cover success, pending, refresh, partial failure,
  unavailable, stale, and offline combinations.
- Dashboard component tests check offline-without-data guidance and stale/failed
  announcements, including axe checks. Existing header offline coverage is updated.
- Seven production browser cases cover both directions of partial failure,
  complete failure, stale fallback, loading, retry recovery, and offline/online
  transitions. Their status panels are checked at 320, 768, and 1366 pixel widths.
- The full 42-test production browser suite passes, including keyboard,
  reduced-motion, high-contrast, and responsive regressions. The production
  dashboard and unavailable panel were also visually inspected.
- Type, lint, unit/component/accessibility, build, formatting, and release
  preflight are required release gates. The build measures 182.1 KiB JavaScript
  and 25.5 KiB CSS gzip under unchanged 190/26 KiB limits.

This phase consumes existing internal response models and the existing stale
response marker. No NASA integration, credentials, caching policy, or upstream
contract changed. These are implementation and automated results, not participant
research; phase 2 remains awaiting recruitment. Browser connectivity is a browser
signal, not a network reachability test, and data availability is not a forecast.
