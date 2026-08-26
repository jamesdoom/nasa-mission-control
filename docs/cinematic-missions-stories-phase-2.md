# Cinematic missions and stories — phase 2

Reviewed 2026-08-26. This phase changes presentation and navigation within existing educational records. It does not add scientific claims, content categories, telemetry, or account behavior.

## Mission briefing sequence

Mission records retain their full-frame, locally optimized NASA images but now frame them as an operational briefing. The hero exposes a keyboard-operable objective → evidence → chronology path before the detailed record. Status, destination, vehicle, Flight Log action, credit, and source remain visible within the same composition. Achievement panels, evidence sections, and chronology rows reuse the Phase 1 atmosphere and surface tokens so the path from question to result remains visually continuous.

## Story visual sequence

Each of the three existing science stories now opens with a sourced NASA hero drawn from an already reviewed Mission Archive image:

- Mars habitability uses Curiosity imagery.
- The Sun–Earth connection uses Parker Solar Probe imagery.
- Cosmic observatories use James Webb Space Telescope imagery.

Every image has descriptive alternative text, visible credit, and a direct NASA source. The image is context rather than evidence by itself; chapter evidence labels and scientific limits remain unchanged. Chapters use a connected sequence marker, evidence captions have their own bounded surface, “carry forward” conclusions remain adjacent, and chronology points share the same progression language.

## Motion, accessibility, and responsive evidence

The only new motion is a restrained hero-image settle on arrival. The global reduced-motion rule collapses it to a static 0.01 ms duration, which the browser test verifies for both mission and story heroes. No meaning depends on movement or depth.

Browser checks cover 320px, 768px, and 1366px widths, require no horizontal overflow, and assert the mission sequence navigation, sourced story image, and reduced-motion result. Deterministic evidence is retained in:

- `cinematic-mission-320.png`
- `cinematic-mission-1366.png`
- `cinematic-story-320.png`
- `cinematic-story-1366.png`

The complete component/accessibility suite, browser journeys, formatting gate, production build, offline verification, and compressed-asset budgets remain release requirements. The earlier emailed CI failure for commit `b0bb101` was an isolated formatting-check failure; the corrected branch includes that check before this phase is pushed.
