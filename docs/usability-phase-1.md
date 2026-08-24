# Experience audit and usability refinement

Phase completed: August 2026

## Scope and method

This audit covers five primary journeys: a first visit, live-data exploration,
the Mission Archive, Guided Discovery, and the browser-local Flight Log. It
uses repository inspection, deterministic Playwright flows, automated axe
checks, keyboard operation, mobile viewports, 200% browser zoom, reduced-motion
emulation, and forced-colors-aware CSS. No visitor analytics, fingerprinting,
cookies, or interaction uploads were added.

## Before and after evidence

| Journey           | Before                                                                                                             | Refinement                                                                                                    | Acceptance evidence                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| First visit       | A seven-card section incorrectly said completed instruments were “coming online,” leaving the next action unclear. | Three task-oriented routes now state purpose, evidence type, and approximate commitment.                      | Playwright verifies all three starting choices and the evidence-label guide.                             |
| Live exploration  | “Live,” retrieval time, observation time, and publication latency could be mistaken for the same thing.            | A compact onboarding guide defines Live, Latest available, Curated, and Calculated before deeper exploration. | Axe covers the semantic definition list; existing provenance tests cover detailed disclosures.           |
| Global navigation | Eleven numbered modules appeared as one undifferentiated list.                                                     | Explore is grouped into Observe now, Explore NASA, and Learn and compare.                                     | Desktop and mobile Playwright flows verify disclosure operation and group labels.                        |
| Mission Archive   | Destination cards and three filters lacked an obvious recovery action.                                             | Filters are labeled optional, active filters expose Clear filters, and no-results offers Show all missions.   | Existing URL-backed filter tests remain authoritative; component and end-to-end suites cover regression. |
| Guided Discovery  | Nine long journey cards required scanning the entire page to choose a topic.                                       | A question-first jump index provides direct, descriptive entry points while preserving every full path.       | Native anchors remain keyboard-operable and existing guided-path tests verify continuations.             |
| Flight Log        | The empty state offered one generic archive link and did not explain how saving works.                             | It explains the save control, local-only storage, and offers image-first or mission-first actions.            | Existing empty, populated, filtering, backup, and accessibility tests remain in the release gate.        |

## Structured usability script

Run these tasks with five participants if qualitative testing is available. Do
not record names, email addresses, IP addresses, free-form browsing history, or
screen recordings. Store only task-level success, time band, and optional
participant-provided notes.

1. From the dashboard, find one current or recently published NASA observation.
2. Explain in your own words what “latest available” means.
3. Find a Mars mission, narrow the archive, then return to all missions.
4. Choose a guided investigation about a topic that interests you and open its first step.
5. Save one record, find it in the Flight Log, filter it, and clear the filter.
6. On a phone-sized viewport, open Explore and locate Space Weather.
7. Complete tasks 3–5 with only a keyboard and again at 200% zoom.

Record only:

- completion: completed / completed with prompt / not completed;
- time band: under 30 seconds / 30–90 seconds / over 90 seconds;
- wrong turns: count only;
- confidence: 1–5, selected by the participant;
- optional note: participant-authored and scrubbed of personal information.

## Release checklist

- Keyboard: skip link, menu disclosure, grouped links, filters, jump links, and recovery actions.
- Screen reader: one page heading, named navigation regions, announced route changes, semantic status and definition content.
- Motion: route arrival animation suppressed by `prefers-reduced-motion`.
- Zoom: core navigation and starting choices reflow at a 320 CSS-pixel viewport, equivalent to a 640-pixel viewport at 200% browser zoom, without a two-dimensional scroll requirement.
- Mobile: 390 × 844 journey checks and minimum 44 × 44 CSS-pixel coarse-pointer targets.
- Contrast: automated axe coverage plus explicit forced-colors borders and focus indicators.
- Privacy: structured testing only; no production interaction collection.

The deterministic portfolio screenshots in `docs/screenshots` provide the visual
baseline. Regenerate them only through `npm run screenshots:update` after the
full release gate passes.
