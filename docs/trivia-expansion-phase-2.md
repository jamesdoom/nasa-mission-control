# Trivia expansion and refinement — phase 2

Reviewed 2026-08-25 by the learning-content reviewer (repository maintainer until delegated).

## Outcome

The existing Moon, planets, observatories, and deep-space channels each contain 16 questions. The same cadet, specialist, and commander difficulty controls remain; every channel has at least four questions at each difficulty. No category, route, persistence behavior, scoring feature, or external service was added.

Each question now includes:

- four distinct choices and one unambiguous answer;
- a corrective explanation of at least 80 characters that teaches the underlying concept rather than merely naming the correct choice;
- a specific NASA or NASA Science source;
- an ISO review date shown beside the source after an answer;
- wording that avoids “latest,” “currently,” “today,” and “right now,” reducing dependence on facts that can change between reviews.

## Source review

The expansion uses current first-party NASA topic and mission pages for Moon facts and eclipses, the solar system and planets, Webb, Hubble, Chandra, TESS, Kepler, Spitzer, Voyager, New Horizons, and the Deep Space Network. Questions favor durable facts such as orbital geometry, mission design, observing wavelengths, planetary classification, and historical encounters. Changing discovery totals, moon counts, schedules, and “most recent” records were deliberately excluded.

Source availability is not treated as scientific verification. The review date records a human editorial pass; future edits must re-read the cited source before advancing it.

## Replayability and accessibility evidence

A filtered simulation traverses its unique question records by index and never selects a record twice, so no question repeats within a normal session. The integrity suite requires unique IDs and normalized prompts, exactly 16 records per existing channel, at least four at each channel/difficulty intersection, and an answer-position spread no greater than four. It also bounds prompt and explanation lengths, rejects unstable time wording, validates answer indices and distinct choices, and requires dated `nasa.gov` sources.

The existing native radio filters, buttons, live score region, keyboard operation, focus behavior, high-contrast support, reduced-motion treatment, and automated accessibility coverage remain unchanged. The visible review date adds provenance without relying on color or hover content.

The bank is delivered as a runtime-validated static JSON content asset rather than executable JavaScript. It is explicitly precached with the installable shell, so the curated simulation remains available offline without consuming the application’s JavaScript safety margin. The verified build measures 177.3 kB total JavaScript gzip, retaining 6.7 kB beneath the 184 kB budget.
