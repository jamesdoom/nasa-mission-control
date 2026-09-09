# Main journey validation — phase 2

Status: prepared; awaiting real participant sessions. No participant findings,
interface fixes, or retest results are claimed. Owner: Product owner, with the
frontend and accessibility maintainers responsible for fixes and verification.

This phase requires three real participants, including a screen-reader user,
to attempt first visits, finding evidence, saving discoveries, and learning.
It does not use the earlier phase's maintainer acceptance as participant evidence.
It also does not claim the larger delayed-learning or five-person terminology
studies described in [the existing research protocol](learning-accessibility-research-phase-4.md).

## Session setup

Recruitment status: the product owner confirmed on 2026-09-08 that participants
still need recruiting. No sessions are scheduled or completed.

Suggested invitation for the product owner to send:

> Would you be willing to try a NASA exploration app for about 30–40 minutes?
> You would find an observation, check its source, save a discovery, and try a
> learning activity. We are testing the app, not your space knowledge. We are
> looking for three people new to the app, including someone who regularly uses
> a screen reader. You can use your usual setup, take breaks, or stop at any time.
> We will keep de-identified task notes, without recordings or personal content.
> If interested, please let me know your availability and whether you use a
> screen reader so we can arrange a suitable session.

Handle replies and scheduling privately outside the repository. Confirm only
prior app familiarity, preferred device/input method, screen-reader use, and
availability; no diagnosis or other sensitive background is needed. Assign the
participant code when scheduled. Invitations have not been sent by the agent.

Recruit three people unfamiliar with the app. Include someone who regularly uses
a screen reader; use their familiar browser, operating system, and assistive
technology. Where practical, use a desktop participant, a phone participant,
and the screen-reader participant. Do not substitute an automated accessibility
scan or a sighted maintainer switching on a reader for that participant session.

Allow about 30–40 minutes per session, with additional time or breaks as needed.
Use the same deployed build for all three initial sessions. Record its URL and
commit or deployment identifier, date, viewport, input method, and browser/OS/
screen-reader versions. Verify the deployed revision before testing; a Git push
alone does not verify the deployed build. Begin at the dashboard using an empty
test profile when the participant is comfortable doing so. Do not clear existing
personal storage. Allow screen-reader preferences to remain intact.

Read aloud: “We are testing the app, not you. You can stop or skip a task at any
time. Please tell me what you expect and anything that feels unclear. I will
record task outcomes and de-identified observations, not your personal content.
May we proceed?” Record consent as yes/no only. If declined, do not run or retain
the session. Participants may work quietly, especially while listening to speech.

Use codes P01–P03 only. Keep completed individual sheets in an access-controlled
research record, not in Git or application telemetry. Do not collect names,
contact details, recordings, personal Flight Log contents, or reflection text.
The repository receives aggregate outcomes and de-identified issue descriptions.
The [blank sheet](usability-phase-2-session-template.md) contains no actual data.

## Tasks: read the prompt without revealing the route or control label

Ask every participant to attempt all four tasks. Preserve their state between
tasks; record any facilitator reset or substitute task explicitly.

| Task                | Participant prompt                                                                                                                                                         | Facilitator success check                                                                                                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1: First visit     | “Starting here, find a NASA observation that interests you. Tell me what you expect to find before opening it.”                                                            | Participant finds an observation and explains what the chosen destination provides.                                                                                                                           |
| T2: Evidence        | “How would you check where this information comes from and how current it is? Show me what supports your answer.”                                                          | Participant locates the source and distinguishes observation/publication time from retrieval time where supplied. They identify uncertainty rather than assuming current retrieval means current observation. |
| T3: Save and return | “Keep this discovery so you can find it later. Go somewhere else in the app, then find the discovery you kept. Where do you think it is stored?”                           | Participant saves and retrieves a record and understands storage is local to this browser. If their chosen item cannot be saved, record that finding before suggesting a saveable record.                     |
| T4: Learning        | “Find an activity that helps you learn about a space topic. Try a step and its question, then show how you would return to your progress. What did the feedback tell you?” | Participant finds a learning activity, opens a resource, attempts its check, understands feedback, and locates retained progress. Completion is not evidence of improved or retained learning.                |

After each task ask: “What was unclear?” and “How confident are you that you
completed that task, from 1 to 5?” At the end ask which label or competing action
most affected their choices. Ask these after the attempt, not as navigation hints.

For the screen-reader session, observe heading/landmark navigation, control
names, focus after navigation, save/status announcements, question feedback,
and returning to progress. Record the specific control and announcement problem
without recording personal speech or content. Do not require a pointer to recover.

## Facilitator and scoring rules

- Start without coaching. A neutral “What would you try next?” is a prompt and
  must be counted. If help is requested, first record the obstacle, then record
  any hint and classify completion as assisted.
- Record each task as independent, assisted, blocked, or not attempted. Keep
  not-attempted tasks separate from failures; report denominators explicitly.
- Record time bands: under 30 seconds, 30–90 seconds, 91–180 seconds, or over
  180 seconds. These are descriptive, not screen-reader performance targets.
- Record prompt count, wrong turns, confidence, and a concise observed action.
  Keep participant observations separate from facilitator interpretations.
- Stop or offer to move on if the participant requests it or is stuck. Record
  where they stopped. Never silently replace a failed task with an easier one.
- Record upstream failures separately from navigation/comprehension barriers.
  An unavailable live source is still useful evidence about recovery. A curated
  fallback is an assisted substitute, not an independent success on the original task.

## Turn findings into changes

After all three initial sessions, aggregate task outcomes and identify recurring
confusion. Do not report percentages or population-wide claims for this sample.
Give each actionable finding an ID, affected task/control, observed behavior,
frequency/denominator, severity, owner, proposed change, and acceptance criterion.

Fix a task-blocking accessibility defect even if observed once. Prioritize repeated
label/navigation confusion over cosmetic preferences. Simplify the relevant label,
group, or action only where the evidence supports the change; preserve a working
route for the original task. Reproduce the issue before implementation and add
focused automated coverage where useful. Keep speculative maintainer ideas in
a separate section; do not count them as participant findings.

## Retest and completion gate

Invite the affected participants to retry the original prompts on the fixed build,
without revealing the solution. Screen-reader barriers require a human retest
with the same assistive-technology pairing. Record initial and retest build IDs,
outcomes, assistance, remaining barriers, and whether the original acceptance
criterion is met. Note repeat-exposure bias; do not claim a fresh first-visit result.

The phase is complete only when:

1. Three real participants have attempted all four tasks, including the
   screen-reader session, with usable de-identified evidence.
2. Observed blockers have linked fixes and successful affected-journey human
   retests. An unavailable retest remains pending, not passed. If no blockers were
   observed, report that bounded result without inventing a change.
3. Required type, lint, unit/component/accessibility, production-browser, build,
   formatting, asset, and release checks pass for the final implementation.
4. Aggregate findings, limitations, and actual session counts are reflected in
   the roadmap and evidence register; the final diff is reviewed, committed,
   and pushed as the completed phase.

Current completed participant sessions: 0. Current human retests: 0.
