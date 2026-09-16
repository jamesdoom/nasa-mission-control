# Launch review and participant validation

**Decision: hold broad promotion.** Phase 5 is in progress. Recruitment is pending; no participant sessions or outcomes have been supplied. Technical checks do not satisfy the participant completion gate.

## Arrange the sessions

The product owner will recruit 3–5 people unfamiliar with the app. Include phone and desktop users, and seek someone who regularly uses keyboard navigation or a screen reader. Use each person's familiar device and input method. This small study identifies practical barriers; it is not a representative usability or accessibility certification.

Suggested invitation (draft only; not sent):

> Would you be willing to spend about 25 minutes trying a space-exploration website on your own device? You do not need any space knowledge. We want to see what is clear or confusing. No account, purchase, or installation is needed. You may stop whenever you like.

Share only the [participant task sheet](participant-task-sheet.md) with participants. Keep facilitator success criteria and previous findings out of their instructions. Ask for agreement before observing or recording. Do not clear saved data or request access to private accounts. Keep names, contact information, recordings, and individual notes outside Git; return de-identified observations using participant IDs.

## Run and record

Use the [existing facilitator guide](appearance-validation-phase-5.md) for success checks. Start each session from the public homepage, record the deployed revision/build asset, and let the person choose their own route. Avoid pointing at navigation labels. If assistance becomes necessary, record what was said and classify that attempt as assisted. A task interrupted by NASA or connectivity failure needs a later retest; it is not an independent success. Record earlier-task dependencies explicitly.

Copy this block once per participant into private session notes:

```text
Participant ID:
Date/time:
App URL and revision/build asset:
Device, browser, input method, assistive technology (if used):
Prior app familiarity:
Agreement to observation/notes obtained:

For each task (1–4):
Outcome: independent / assisted / blocked / not attempted
Approximate duration:
What they actually did / where they hesitated:
Any assistance, exact wording if recorded:
NASA/network error or dependency on an earlier task:
Participant comment (quote only if captured accurately):

Most consequential obstacle:
Retest needed:
```

Leave unobserved fields blank. Return de-identified task outcomes and observed difficulties; do not provide credentials or personal recordings. The observer should distinguish observed behavior from interpretations about its cause.

## Triage and retest

No participant-derived issues are recorded yet. Do not substitute automated browser runs or imagined personas for sessions.

| Finding                  | Observed behavior | Affected / attempted | Severity | Fix revision | Retest result |
| ------------------------ | ----------------- | -------------------- | -------- | ------------ | ------------- |
| Awaiting actual sessions |                   |                      |          |              |               |

Treat inability to complete a core journey, inaccessible controls, or loss of saved work as launch blockers. Address the most consequential issue first within the existing feature scope. Retest affected tasks without hints, preferably including an unfamiliar person who has not learned the old flow. Keep first-attempt and retest results separate and report denominators. Any unresolved blocker keeps the launch decision on hold.

## Known technical follow-up

Phase 4 measured slow-mobile homepage LCP between **4.320 and 7.396 seconds** in individual controlled runs. That is outside the good target; it remains unresolved and needs investigation before broad promotion. The corrected outage layout reached CLS 0 and still exposed mission content. See [measurement conditions and limits](traffic-readiness.md). No field INP or real-user 75th-percentile pass has been established.

## Short launch checklist

- [ ] At least three unfamiliar participants attempted all four core journeys on their own devices; phone and desktop coverage recorded.
- [ ] Participants completed the core journeys without coaching, either initially or in documented retests; assisted attempts remain clearly labeled.
- [ ] Consequential findings have fixes and retest evidence; no unresolved launch blockers remain.
- [ ] Slow-homepage delivery has been investigated and the launch decision updated with comparable measurements.
- [ ] Final application revision passes types, lint, unit/component/accessibility tests, browser tests, build, asset budgets, and offline checks.
- [ ] That same deployed application build passes public health, direct-link, mobile journey, and metadata checks after the last functional fix.
- [ ] Refreshed screenshots match the final interface and are labeled as deterministic fixtures where applicable.
- [ ] Product owner reviews the evidence and approves promotion; the previous working revision and rollback procedure are available.

The checklist deliberately stays open until the final participant-driven revision is known. Preparatory checks and screenshots may be recorded below but must be repeated where later fixes invalidate them.

## Prepared evidence

The application baseline is `dac0fab`; documentation baseline is `2ffcb16`. On September 16, 2026, types, lint, all 183 unit/component tests (including accessibility checks), production build, all 48 browser tests, generated metadata checks, compressed asset budgets, and offline-shell verification passed. The browser suite regenerated the portfolio screenshots using deterministic NASA fixtures; desktop dashboard, mobile navigation, and trivia captures were visually inspected. These captures demonstrate interface state, not current NASA observations or participant behavior.

Public health/direct-link checks and the mobile mission/Flight Log/legacy-redirect checks passed. All twelve main deployed entry pages returned 200, correct titles and social metadata, and the same application asset as the local build: `assets/index-qZKIlPLk.js`. [Build verification](evidence/launch-review/deployed-build.json). This verifies the application content, not a provider-reported deployment commit SHA. [Public smoke evidence](evidence/launch-review/public-smoke.json) and [mobile journey evidence](evidence/launch-review/mobile-journeys.json).

Existing performance budgets passed at 168.5 KiB total compressed JavaScript and 24.1 KiB compressed CSS. These checks do not close the separate slow-network homepage finding. No application code changed during this preparatory update. The [incident and rollback procedure](operations.md#incident-and-rollback-procedure) remains available. No participant success rate or launch approval is claimed.
