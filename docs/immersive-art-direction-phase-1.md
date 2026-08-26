# Immersive art direction and atmospheric foundation — phase 1

Reviewed 2026-08-26. This phase changes presentation only; routes, scientific claims, data handling, and product categories are unchanged.

## Art-direction system

The shared shell now assigns every route to one of five related moods: command, mission, Earth, live instrument, or learning. Each mood changes only two low-opacity illumination colors. A common deep-space background, sparse star texture, grid, surface hierarchy, border system, typography pairing, spacing rhythm, and elevation model keep the application recognizable as one Mission Control environment.

Core foreground colors are explicit tokens: `--text` provides the primary reading color, `--muted` supports secondary copy, `--surface` and `--surface-raised` keep content above atmospheric effects, and `--line`/`--line-strong` separate controls and evidence without heavy boxes. DM Sans remains the reading face and Space Mono remains reserved for telemetry labels, statuses, and compact metadata.

## Route moods

| Mood     | Routes                                                      | Visual intent                                 |
| -------- | ----------------------------------------------------------- | --------------------------------------------- |
| Command  | Dashboard, search, investigation, Flight Log, About         | Neutral cyan and operational blue             |
| Mission  | Mission Archive, mission records, comparisons, map, stories | Observatory blue and deep indigo              |
| Earth    | Earth Observatory                                           | Ocean teal and atmospheric blue               |
| Live     | APOD, asteroids, space weather, NASA Media                  | Telemetry cyan with a restrained amber signal |
| Learning | Guided Discovery, Learning Center, Scale Lab, trivia        | Violet discovery light balanced by cyan       |

The moods are decorative context, not status signals. Data freshness, hazards, errors, focus, and evidence labels retain their existing semantic colors and wording.

## Accessibility and responsive evidence

Atmospheric layers sit behind the application, ignore pointer input, and never reduce the opacity of foreground content. Shared text and panel tokens remain unchanged across moods. Forced-colors mode continues to replace decorative styling with system colors, while fixed backgrounds already fall back to scrolling on narrow layouts. Route-family tests require the correct mood, shared reading tokens, and no horizontal overflow; existing visual checks continue covering 320px, tablet, laptop, large-display, and 200%-zoom-equivalent widths.

Deterministic hero captures are retained as `atmosphere-mission.png`, `atmosphere-earth.png`, `atmosphere-live.png`, and `atmosphere-learning.png`. They show the mood differences against the same shared text, border, and surface hierarchy without relying on changing NASA responses.

The production build and compressed-asset gate document the measured cost of the shared foundation. Subsequent immersive phases should compose these tokens instead of adding a second visual system.
