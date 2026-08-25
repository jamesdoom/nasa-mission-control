# Learning outcomes and accessibility research — Phase 4

## Evidence status

Technical accessibility sessions and interface refinements are reproducible in this repository. The product owner reported completing an acceptance test on 2026-08-25 and requested release of the phase. No participant quotations, individual reflections, or comprehension scores were supplied, so none are invented and no learning-effectiveness claim is made. The larger study below remains the next research cycle rather than a release blocker.

Use participant codes such as `P01`; never record names, email addresses, IP addresses, account identifiers, screen recordings, or browser-local Flight Log content. Store the de-identified session sheet in the accountable monthly review issue or another access-controlled research record, not in application telemetry.

## Repeat-session learning study

Recruit at least three learners who have not used the selected track. Use the same track in two sessions separated by 2–7 days.

### Session 1

1. Record participant code, date, track, viewport, input method, and assistive technology only.
2. Ask the learner to state what they expect to learn before opening a resource.
3. Let them complete the guided sequence, knowledge check, and reflection without coaching.
4. Record first-attempt check accuracy, resources completed, prompts needed, and whether the reflection cites zero, one, or at least two pieces of evidence.
5. Export learning progress only if the participant explicitly agrees; the file stays on their device.

### Session 2

1. Before reopening resources, ask the learner to explain the objective and recall one evidence-supported claim.
2. Restore the participant's local backup only when using a different test browser and with explicit permission.
3. Repeat the knowledge check and ask what changed in their explanation.
4. Record delayed check accuracy and evidence recall using the rubric below.

| Measure                 | 0                                            | 1                                              | 2                                                   |
| ----------------------- | -------------------------------------------- | ---------------------------------------------- | --------------------------------------------------- |
| Objective comprehension | Incorrect or no response                     | Partly correct with prompt                     | Accurate in own words                               |
| Evidence recall         | No relevant evidence                         | Relevant observation without source connection | Claim connected to a relevant source or observation |
| Evidence distinction    | Confuses observed/calculated/curated/current | Correct after prompt                           | Correct without prompt                              |

Report only aggregate counts and ranges when at least three participants finish both sessions. Do not publish an individual reflection. A learning-outcome claim requires improved or retained delayed comprehension; activity completion alone is not evidence of learning.

## First-visit terminology study

Recruit five new participants who have not seen the interface. From the dashboard, ask each person to locate one current or recent observation and explain `live`, `latest available`, `curated`, and `calculated` in their own words. Do not define the terms first.

For each term record `accurate`, `partly accurate`, or `incorrect`; record prompt count and wrong turns as numbers. Ask which word or label caused uncertainty. Change terminology only when at least two participants show the same misconception, or immediately when one finding exposes a safety or accessibility barrier.

## Accessibility session matrix

Use the current production build and record browser/OS/assistive-technology versions. A pass requires task completion without a pointer, loss of content, two-dimensional page scrolling, motion that ignores preferences, or meaning conveyed only by color.

| Session        | Required task                                                        | Repository evidence                 | Human evidence required                                |
| -------------- | -------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------ |
| Keyboard       | Choose a track, complete a step/check, save reflection, print        | Playwright keyboard journey         | Focus order and visible focus review                   |
| Screen reader  | Navigate headings/regions, understand progress/result, complete form | Axe and semantic component tests    | NVDA/Firefox or VoiceOver/Safari announcement notes    |
| Zoom/reflow    | Complete the task at 200% and 400% equivalent widths                 | 320 CSS-pixel Playwright check      | Browser zoom session at 200% and 400%                  |
| High contrast  | Identify controls, status, completion, and worksheet                 | Forced-colors Playwright emulation  | Windows High Contrast visual review                    |
| Reduced motion | Navigate into and through the track                                  | Reduced-motion Playwright emulation | Confirm no disorienting transition remains             |
| Print          | Print or save the activity sheet                                     | Print-media Playwright check        | Paper/PDF review for clipping, URLs, and writing space |

## Technical findings and changes

| Finding                                                                                                        | Severity                                | Change                                                                                                         | Verification                                |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Completion exposed only one prose sentence, making objective and evidence state hard to scan                   | Moderate learning/accessibility barrier | Added a semantic objective, resources, check, and reflection definition list plus an explicit no-mastery claim | Component test and axe coverage             |
| Printed activity lacked a participant-safe identifier, per-source evidence space, and delayed-retrieval prompt | Moderate educator barrier               | Added a de-identified learner evidence sheet and repeat-session retrieval section with printable writing space | Print-media Playwright check                |
| Accessibility preferences were covered globally but not through the learning check itself                      | Moderate regression risk                | Added a keyboard journey under forced colors, reduced motion, and 320-pixel reflow                             | Playwright accessibility-preference journey |

## Barrier priority and exit decision

Accessibility blockers, data-integrity defects, privacy regressions, and comprehension failures outrank cosmetic work regardless of backlog score. A major barrier blocks release until fixed and re-tested. Moderate barriers require an owner and acceptance evidence before the next cosmetic update. Minor cosmetic findings cannot displace either category.

Phase 4 implementation exits when technical checks pass, the maintainer accepts the tested experience, documented major barriers are resolved, and the evidence accurately states its limits. A future learning-effectiveness claim still requires at least three learners to complete both sessions, five new participants to complete terminology testing, and the human assistive-technology matrix to be recorded.

## Acceptance evidence

- Sample: one product-owner/maintainer acceptance test, reported 2026-08-25.
- Outcome: the product owner requested completion and release of Phase 4 after testing the app.
- De-identification: no name, quotation, reflection, device record, or browser-local data is stored.
- Comprehension measurement: not supplied; therefore no measured learning improvement or retention is claimed.
- Technical evidence: component/axe coverage and the Playwright keyboard, forced-colors, reduced-motion, reflow, and print journey pass.
- Resolved barriers: completion evidence is now semantically scannable; the print sheet now supports anonymous evidence notes and delayed retrieval; the learning flow has preference-specific regression coverage.
- Major unresolved barriers reported: none supplied with the maintainer acceptance.

The next research cycle should record only aggregate completion ranges, first/delayed comprehension distributions, repeated terminology misconceptions, assistive-technology barriers, changes made, and verification links. Do not add row-level participant data to this document.
