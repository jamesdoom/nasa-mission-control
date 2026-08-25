# Privacy notice

Reviewed 2026-08-25.

NASA Mission Control does not provide accounts, advertising, cross-device
profiles, or a project-owned visitor database.

## Data that stays in the browser

Flight Log favorites, notes, tags, custom collections, saved views, comparison
bookmarks, recent activity, and trivia streaks are stored in browser local
storage. They are not uploaded automatically. Backup files are created and
read on-device only when the user explicitly exports or imports one. Clearing
site data removes these records from that browser.

## Operational data

- Vercel Speed Insights receives route-level Core Web Vitals in production.
- The server logs request path, method, status, duration, request ID, cache
  result, and sanitized upstream host/path outcomes.
- Uncaught client failures may report only failure kind, a message capped at 300
  characters, and a pathname capped at 200 characters.

The application does not intentionally log query values, NASA API keys, Flight
Log content, notes, tags, referrers, email addresses, precise location, or IP
addresses. Infrastructure providers may process standard network metadata under
their own policies. No general-purpose Vercel Web Analytics or advertising
tracker is enabled by this repository.

## User controls and retention

Users can remove individual saved records, export a portable backup, or clear
the site’s browser storage. Runtime-log and Speed Insights retention is governed
by the configured Vercel plan; GitHub smoke/performance artifacts are retained
for 30 days. This project has no account-level access or deletion request flow
because it does not hold account records.

## Feedback and accessibility reports

Feedback is optional and uses public GitHub issue forms; the application does not add an analytics or feedback database. Forms instruct reporters not to include personal information or private Flight Log content. GitHub processes submitted issue data under its own policies. Users who do not want a public report should not submit the form.
