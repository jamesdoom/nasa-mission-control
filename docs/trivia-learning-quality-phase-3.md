# Trivia depth and learning quality — phase 3

Reviewed 2026-08-26. This phase deepens the four existing trivia topics and three existing learning tracks; it adds no category, route, account, or external service.

## Question-bank evidence

Moon, planets, observatories, and deep space each contain 24 reviewed questions: eight cadet, nine specialist, and seven commander records. The 96-question bank has exactly 24 correct answers in each answer position. Every prompt is unique and avoids unstable “latest” wording; every explanation supplies concise scientific context, an official NASA source, and a human verification date.

The bank remains a runtime-validated static JSON asset that is precached for offline use. A filtered session still presents every matching question at most once. A bounded list of answered question IDs stays in browser-local storage and places unseen records first on the next run. Scores and individual answers remain session-only.

## Learning quality

Each learning objective now asks the learner to classify evidence, make a bounded comparison, and support an interpretation with an official source. Mars and observatory tracks hand off to intermediate trivia. Reflection prompts require a claim, evidence class or instrument, source, and limitation. Completion summaries name the practiced distinctions and preserve the existing statement that participation is not mastery.

## Integrity gates

Automated coverage requires:

- 96 unique IDs and prompts, with exactly 24 questions per existing topic;
- eight cadet, nine specialist, and seven commander questions per topic;
- equal aggregate answer-position counts;
- four distinct choices, bounded readable prompts and explanations, stable wording, official NASA URLs, and valid review dates;
- deterministic unseen-first ordering without dropped or duplicated records;
- source-backed learning enrichment with substantive reflections and completion synthesis.

The full accessibility, browser-journey, content-review, offline-shell, production-build, and performance-budget gates remain required before release.
