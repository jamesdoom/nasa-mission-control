# Appearance and usability phase 5: validation

Status: in progress. Automated validation and refreshed captures prepared on 2026-09-15; real participant sessions and any resulting fixes/retests remain pending. Application baseline: 1d79efc. Do not mark this phase complete based on automated results alone.

## Current continuation

On September 16, 2026, the product owner confirmed that participants still need to be arranged. The [launch review](launch-review.md) records fresh technical verification and refreshed screenshots against application baseline `dac0fab`, plus a [shareable participant task sheet](participant-task-sheet.md). The earlier evidence below is historical. Actual sessions, observed fixes, and participant retests remain pending.

## Maintainer evidence

The initial deterministic browser suite passed 42 tests, with one production-only test skipped. After correcting capture setup, the refresh passed 39 tests and encountered three screenshot file-write errors; all three passed on a serial retry. It covers APOD date URLs and error recovery; saving and finding APOD in Flight Log; mission filtering and record navigation; trivia scoring, explanations, and session restoration; mobile navigation, keyboard focus, reflow, forced colors, and reduced motion. Screenshots were regenerated using the tested flows. Full-page portfolio captures now reset scroll and transient focus before capture so sticky headers do not appear mid-page. Typecheck, lint, unit/component/accessibility tests, production build, compressed asset budgets, and offline-shell verification passed.

| Journey         | Existing automated evidence                                                    | Participant question still open                                     |
| --------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| APOD            | Archive-date URLs, save persistence, recovery without losing the selected date | Can people find a previous date and understand the displayed media? |
| Mission Archive | Filter and open a record; empty-filter guidance; responsive layouts            | Are the filters and reset action understandable without prompting?  |
| Flight Log      | Save, search, filter, reset, and reopen records                                | Can people independently find what they saved?                      |
| Trivia          | Answer scoring, source explanations, session restoration                       | Do people understand the feedback and how to continue?              |

No participant outcomes, usability improvement percentages, or learning gains are claimed. Automated checks cannot establish these. No new application behavior was needed based on this validation run.

## Participant session guide

Use three people unfamiliar with the app, including a phone user and someone who regularly uses a screen reader. Allow about 30 minutes and use each person's familiar device and input setup. This is a small formative study, not a representative accessibility or usability certification.

Verify the deployed revision before sessions; a Git push does not prove deployment. Record build URL/revision, browser, viewport, input method, and assistive technology if used. Use a separate test profile with permission; do not erase personal saved records. Explain that the app is being tested, not the person's space knowledge, and that they may stop or skip any task. Obtain agreement before taking notes. Keep identities, contact details, and individual notes outside Git; retain only de-identified aggregate findings here. Do not send invitations automatically.

Read these prompts without naming the route or control to use:

1. Find NASA's astronomy selection for January 1, 2024. Tell me what date the page is showing, then save it so you can find it later.
2. Find a mission that went to Mars and open its record. Then return to the full mission list.
3. Find the astronomy record you saved earlier and reopen it. Tell me where you would look for it on a later visit.
4. Try a space quiz question. Tell me what the feedback means, then continue to the next question.

Success checks for the facilitator: requested archive date displayed and saved; a Mars mission opened and filters cleared; saved APOD reopened from Flight Log; answer submitted, explanation encountered, and next question reached. Separate NASA/network interruptions from interface barriers. If a task depends on a failed earlier task, record any setup assistance explicitly.

For each task record independent / assisted / blocked / not attempted, approximate time, wrong turns, assistance, and observed behavior. Leave unobserved values blank. Do not turn facilitator interpretations into participant quotations. Ask what was unclear after each task without suggesting a preferred answer.

## Findings and retests

No sessions completed or participant notes supplied in this task. Recruitment and scheduling remain with the product owner.

| Finding                      | De-identified observed behavior | Frequency / attempted | Severity | Fix | Retest revision and outcome |
| ---------------------------- | ------------------------------- | --------------------- | -------- | --- | --------------------------- |
| Pending participant sessions |                                 |                       |          |     |                             |

Prioritize blocked completion, inaccessible controls, or lost saved state first. Fix observed barriers within the existing feature scope and rerun affected quality gates. Retest the affected tasks with participants, recording assistance and remaining barriers. Report denominators and limits; do not infer general learning effectiveness from one quiz.

## Completion gate

Complete real sessions for the four journeys, summarize actual findings, implement and validate necessary fixes, record retests or explicit unresolved issues, and review the final diff. Then update the roadmap, commit, and push the completed phase. Participant research remains in progress. The user subsequently authorized committing and pushing the completed interface simplification and prepared validation evidence, without marking participant research complete.
