# Phase 1: Bring content forward

Completed 2026-09-15. No new features or API changes.

The dashboard retains its space identity with a shorter hero and smaller desktop orbit illustration. Mobile omits that decorative orbit. Mission Archive presents filters and records before the destination overview and source explanation. Flight Log presents search, filters, and saved records before backup management, saved views, and continuation panels. DOM order matches the visual and keyboard order. Existing controls remain available. The collection denominator now correctly reflects four current record types.

## Measured content positions

CSS pixels from the top of the page, at scroll position zero and 900 px viewport height. Tests use deterministic NASA responses and two saved missions. Flight Log measures the start of the saved mission section, including its heading, rather than the card image itself.

| View                     | Desktop 1440 before → after | Mobile 390 before → after |
| ------------------------ | --------------------------- | ------------------------- |
| Dashboard image          | 1326 → 766                  | 1057 → 790                |
| Mission cards            | 1275 → 611                  | 2491 → 1043               |
| Flight Log saved section | 1916 → 620                  | 2315 → 822                |

## Visual evidence

- Dashboard 1440: [before](screenshots/content-first/phase1-before-dashboard-1440.png), [after](screenshots/content-first/phase1-after-dashboard-1440.png)
- Dashboard 390: [before](screenshots/content-first/phase1-before-dashboard-390.png), [after](screenshots/content-first/phase1-after-dashboard-390.png)
- Missions 1440: [before](screenshots/content-first/phase1-before-missions-1440.png), [after](screenshots/content-first/phase1-after-missions-1440.png)
- Missions 390: [before](screenshots/content-first/phase1-before-missions-390.png), [after](screenshots/content-first/phase1-after-missions-390.png)
- Favorites 1440: [before](screenshots/content-first/phase1-before-favorites-1440.png), [after](screenshots/content-first/phase1-after-favorites-1440.png)
- Favorites 390: [before](screenshots/content-first/phase1-before-favorites-390.png), [after](screenshots/content-first/phase1-after-favorites-390.png)

## Validation

Typecheck, ESLint, unit/component/accessibility tests, production build, and compressed asset budgets passed. Browser smoke suite: 41 passed, one production-only test skipped. Desktop and mobile inspection found no horizontal overflow. Existing filter, save, backup, empty/error, keyboard, and responsive coverage passed. This is maintainer verification, not participant usability research.

Later phases should continue reducing secondary-control prominence and review narrow-screen filters and notices. This phase does not claim every mobile record fits above the fold.
