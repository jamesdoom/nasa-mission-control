import { readTriviaSession, writeTriviaSession } from "../utils/triviaSession";
import {
  keepExplorationContext,
  explorationLink,
} from "../utils/explorationContext";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  loadTriviaQuestions,
  resetTriviaCache,
  triviaQuestionCount,
  type TriviaDifficulty,
  type TriviaQuestion,
} from "../data/trivia";
import { ProvenancePanel } from "../components/ProvenancePanel";

const difficulties: TriviaDifficulty[] = ["cadet", "specialist", "commander"];
const categories = [
  "all",
  "moon",
  "planets",
  "observatories",
  "deep-space",
] as const;
type TriviaCategoryFilter = (typeof categories)[number];
const categoryLabels: Record<TriviaCategoryFilter, string> = {
  all: "All topics",
  moon: "Moon",
  planets: "Planets",
  observatories: "Observatories",
  "deep-space": "Deep space",
};
const bestStreakKey = "mission-control:trivia-best-streak:v1";
const questionHistoryKey = "mission-control:trivia-history:v1";

function difficultyFrom(value: string | null): TriviaDifficulty {
  return difficulties.includes(value as TriviaDifficulty)
    ? (value as TriviaDifficulty)
    : "cadet";
}

function categoryFrom(value: string | null): TriviaCategoryFilter {
  return categories.includes(value as TriviaCategoryFilter)
    ? (value as TriviaCategoryFilter)
    : "all";
}

function readBestStreak(): number {
  try {
    const value = Number(localStorage.getItem(bestStreakKey) ?? 0);
    return Number.isInteger(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

function readQuestionHistory(): string {
  try {
    return localStorage.getItem(questionHistoryKey) ?? "";
  } catch {
    return "";
  }
}

function recordQuestion(id: string): void {
  try {
    const history = readQuestionHistory().split("|").filter(Boolean);
    localStorage.setItem(
      questionHistoryKey,
      [...history, id].slice(-96).join("|"),
    );
  } catch {
    /* Session scoring still works. */
  }
}

export function TriviaPage() {
  const [params, setParams] = useSearchParams();
  const difficulty = difficultyFrom(params.get("difficulty"));
  const category = categoryFrom(params.get("category"));
  const filterKey = `${difficulty}:${category}`;
  const [activeFilter, setActiveFilter] = useState(filterKey);
  const [resume] = useState(() => {
    const saved = readTriviaSession();
    return saved?.difficulty === difficulty && saved.category === category
      ? saved
      : null;
  });
  const [sessionNotice, setSessionNotice] = useState(
    resume
      ? "Your last question and score have been restored."
      : "Your current session is kept in this browser as you answer.",
  );
  const [questionBank, setQuestionBank] = useState<TriviaQuestion[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const questions = questionBank.filter(
    (question) =>
      question.difficulty === difficulty &&
      (category === "all" || question.category === category),
  );
  const [index, setIndex] = useState(resume?.index ?? 0);
  const [selected, setSelected] = useState<number | null>(
    resume?.selected ?? null,
  );
  const [score, setScore] = useState(resume?.score ?? 0);
  const [streak, setStreak] = useState(resume?.streak ?? 0);
  const [bestStreak, setBestStreak] = useState(readBestStreak);
  const [complete, setComplete] = useState(resume?.complete ?? false);
  const question = questions[index];

  useEffect(() => {
    let active = true;
    setLoadError(null);
    void loadTriviaQuestions()
      .then((loaded) => {
        if (active) {
          const seen = new Set(readQuestionHistory().split("|"));
          const savedIds = resume?.ids ?? [];
          const compatible =
            savedIds.length > 0 &&
            savedIds.every((id) =>
              loaded.some(
                (q) =>
                  q.id === id &&
                  q.difficulty === resume?.difficulty &&
                  (resume.category === "all" || q.category === resume.category),
              ),
            );
          if (resume && !compatible) {
            setIndex(0);
            setSelected(null);
            setScore(0);
            setStreak(0);
            setComplete(false);
            setSessionNotice(
              "The question bank changed. A new session has started.",
            );
          }
          setQuestionBank(
            [...loaded].sort((left, right) => {
              if (compatible) {
                const l = savedIds.indexOf(left.id);
                const r = savedIds.indexOf(right.id);
                if (l >= 0 || r >= 0)
                  return (l < 0 ? 999 : l) - (r < 0 ? 999 : r);
              }
              return Number(seen.has(left.id)) - Number(seen.has(right.id));
            }),
          );
        }
      })
      .catch(() => {
        if (active)
          setLoadError("The curated question bank could not be loaded.");
      });
    return () => {
      active = false;
    };
  }, [loadAttempt, resume]);

  useEffect(() => {
    if (activeFilter === filterKey) return;
    setActiveFilter(filterKey);
    setSessionNotice("A new topic session has started in this browser.");
    setIndex(0);
    setSelected(null);
    setScore(0);
    setStreak(0);
    setComplete(false);
  }, [activeFilter, filterKey]);

  useEffect(() => {
    if (!questions.length || activeFilter !== filterKey) return;
    const persisted = writeTriviaSession({
      difficulty,
      category,
      ids: questions.map((item) => item.id),
      index,
      selected,
      score,
      streak,
      complete,
    });
    if (!persisted)
      setSessionNotice(
        "Browser storage is unavailable. Progress is kept for this session only.",
      );
  }, [
    questionBank,
    activeFilter,
    filterKey,
    category,
    difficulty,
    index,
    selected,
    score,
    streak,
    complete,
  ]);

  function updateFilters(
    nextDifficulty: TriviaDifficulty,
    nextCategory: TriviaCategoryFilter,
  ) {
    const next = keepExplorationContext(params, {});
    next.set("difficulty", nextDifficulty);
    if (nextCategory !== "all") next.set("category", nextCategory);
    setParams(next);
  }

  function answer(choice: number) {
    if (selected !== null || !question) return;
    setSelected(choice);
    recordQuestion(question.id);
    if (choice === question.answer) {
      setScore((value) => value + 1);
      setStreak((value) => {
        const next = value + 1;
        setBestStreak((best) => {
          const updated = Math.max(best, next);
          try {
            localStorage.setItem(bestStreakKey, String(updated));
          } catch {
            /* Session scoring still works. */
          }
          return updated;
        });
        return next;
      });
    } else {
      setStreak(0);
    }
  }

  function next() {
    if (index === questions.length - 1) {
      setComplete(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setStreak(0);
    setComplete(false);
  }

  return (
    <>
      <section className="section trivia-intro">
        <p className="kicker">
          <span />
          Knowledge simulation // Instrument 07
        </p>
        <div>
          <h1>Space Trivia</h1>
          <p>
            Test your mission knowledge with source-checked questions. Every
            answer includes context and a direct NASA reference.
          </p>
        </div>
      </section>
      <section className="section provenance-section">
        <ProvenancePanel
          kind="curated"
          title="Source-checked educational question bank"
          summary={`${String(triviaQuestionCount)} locally maintained questions`}
          details={[
            "Questions, choices, and explanations are curated content rather than live NASA data.",
            "Every answer reveals the official NASA source used for verification.",
            "History stays local and unseen questions come first.",
          ]}
        />
      </section>
      <section className="section trivia-console-section">
        <p role="status">
          {sessionNotice}{" "}
          <Link to="/favorites#resume">Resume later from Flight Log →</Link>
        </p>
        <div className="trivia-filter-stack">
          <fieldset className="trivia-difficulties">
            <legend>Simulation difficulty</legend>
            {difficulties.map((item) => (
              <label key={item}>
                <input
                  type="radio"
                  name="trivia-difficulty"
                  checked={difficulty === item}
                  onChange={() => updateFilters(item, category)}
                />
                <span>{item}</span>
              </label>
            ))}
          </fieldset>
          <fieldset className="trivia-difficulties trivia-categories">
            <legend>Knowledge channel</legend>
            {categories.map((item) => (
              <label key={item}>
                <input
                  type="radio"
                  name="trivia-category"
                  checked={category === item}
                  onChange={() => updateFilters(difficulty, item)}
                />
                <span>{categoryLabels[item]}</span>
              </label>
            ))}
          </fieldset>
        </div>
        <div className="trivia-telemetry">
          <div>
            <span>Score</span>
            <strong>
              {score}/{questions.length}
            </strong>
          </div>
          <div>
            <span>Current streak</span>
            <strong>{streak}</strong>
          </div>
          <div>
            <span>Best streak</span>
            <strong>{bestStreak}</strong>
          </div>
        </div>
      </section>
      <section className="section trivia-stage" aria-live="polite">
        {loadError ? (
          <div className="state-panel state-panel--error" role="alert">
            <div>
              <strong>Question bank unavailable</strong>
              <p>{loadError}</p>
            </div>
            <button
              className="button button--secondary"
              type="button"
              onClick={() => {
                resetTriviaCache();
                setLoadAttempt((value) => value + 1);
              }}
            >
              Retry loading questions
            </button>
          </div>
        ) : questionBank.length === 0 ? (
          <div className="state-panel" role="status">
            <span className="loader" />
            <div>
              <strong>Loading curated question bank</strong>
              <p>Checking the locally maintained content record…</p>
            </div>
          </div>
        ) : complete ? (
          <div className="trivia-complete">
            <p className="eyebrow">Simulation complete</p>
            <span>
              {score}/{questions.length}
            </span>
            <h2>
              {score === questions.length
                ? "Flawless trajectory"
                : score > 0
                  ? "Mission knowledge logged"
                  : "Return to the briefing room"}
            </h2>
            <button className="button" type="button" onClick={restart}>
              Run simulation again
            </button>
          </div>
        ) : question ? (
          <article className="trivia-question">
            <header>
              <span>
                Question {index + 1} // {questions.length}
              </span>
              <span>
                {difficulty} // {categoryLabels[question.category]}
              </span>
            </header>
            <h2>{question.prompt}</h2>
            <div className="trivia-choices">
              {question.choices.map((choice, choiceIndex) => {
                const answered = selected !== null;
                const correct = answered && choiceIndex === question.answer;
                const incorrect =
                  answered && choiceIndex === selected && !correct;
                return (
                  <button
                    key={choice}
                    type="button"
                    disabled={answered}
                    className={
                      correct ? "is-correct" : incorrect ? "is-incorrect" : ""
                    }
                    onClick={() => answer(choiceIndex)}
                  >
                    <span>{String.fromCharCode(65 + choiceIndex)}</span>
                    {choice}
                  </button>
                );
              })}
            </div>
            {selected !== null && (
              <div className="trivia-debrief">
                <strong>
                  {selected === question.answer
                    ? "Correct trajectory"
                    : "Course correction"}
                </strong>
                <p>{question.explanation}</p>
                <a href={question.source.url} target="_blank" rel="noreferrer">
                  Verify with {question.source.label} ↗
                </a>
                <small>Source reviewed {question.verifiedAt}</small>
                <Link
                  to={explorationLink(
                    question.category === "moon"
                      ? "/missions/apollo-11"
                      : question.category === "planets"
                        ? "/learn?track=mars-evidence"
                        : question.category === "observatories"
                          ? "/learn?track=cosmic-observatories"
                          : "/missions/voyager-1",
                    `/trivia?difficulty=${difficulty}&category=${category}`,
                  )}
                >
                  Explore related evidence →
                </Link>
                <button className="button" type="button" onClick={next}>
                  {index === questions.length - 1
                    ? "Complete simulation"
                    : "Next question"}
                </button>
              </div>
            )}
          </article>
        ) : null}
      </section>
    </>
  );
}
