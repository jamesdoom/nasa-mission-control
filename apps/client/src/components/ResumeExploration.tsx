import { useResumeAnchor } from "../hooks/useResumeAnchor";
import { Link } from "react-router-dom";
import { useSavedExplorations } from "../hooks/useSavedExplorations";
import { useLearningProgress } from "../hooks/useLearningProgress";
import { learningTracks } from "../data/learningTracks";
import { readTriviaSession } from "../utils/triviaSession";

export function ResumeExploration() {
  useResumeAnchor();
  const saved = useSavedExplorations();
  const { tracks } = useLearningProgress();
  const started = learningTracks
    .filter((track) => tracks[track.id])
    .sort((a, b) =>
      (tracks[b.id]?.updatedAt ?? "").localeCompare(
        tracks[a.id]?.updatedAt ?? "",
      ),
    );
  const trivia = readTriviaSession();
  return (
    <section
      className="flight-log-section"
      id="resume"
      tabIndex={-1}
      aria-labelledby="resume-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Continue on this device</p>
          <h2 id="resume-title">Resume exploration and learning</h2>
        </div>
      </div>
      <p>
        Saved explorations keep their filters and return links. Learning and
        trivia progress stays in this browser; live records may change.
      </p>
      <div className="saved-journey-grid">
        {saved.items.map((item) => (
          <article key={item.path}>
            <p className="eyebrow">Saved exploration</p>
            <h3>{item.title}</h3>
            <p>
              {[
                ...new URL(item.path, "https://mission-control.local")
                  .searchParams,
              ]
                .filter(([key]) => key !== "returnTo")
                .map(([, value]) => value)
                .join(" · ") || "Original view"}
            </p>
            <Link to={item.path}>Resume saved exploration →</Link>
            <button
              type="button"
              onClick={() => saved.remove(item.path)}
              aria-label={`Remove exploration ${item.title}`}
            >
              Remove
            </button>
          </article>
        ))}
        {started.map((track) => {
          const progress = tracks[track.id];
          const next = track.steps.find(
            (step) => !progress?.completedSteps.includes(step.id),
          );
          const anchor = next
            ? `step-${next.id}`
            : !progress?.checkPassed
              ? "knowledge-check"
              : "reflection";
          return (
            <article key={track.id}>
              <p className="eyebrow">Learning progress</p>
              <h3>{track.title}</h3>
              <p>
                {
                  track.steps.filter((step) =>
                    progress?.completedSteps.includes(step.id),
                  ).length
                }{" "}
                of {track.steps.length} resources complete · knowledge check{" "}
                {progress?.checkPassed ? "passed" : "pending"}
              </p>
              <Link to={`/learn?track=${track.id}#${anchor}`}>
                {next
                  ? `Continue: ${next.title}`
                  : "Return to check and reflection"}{" "}
                →
              </Link>
            </article>
          );
        })}
        {trivia ? (
          <article>
            <p className="eyebrow">
              {trivia.complete ? "Completed trivia" : "Trivia in progress"}
            </p>
            <h3>Space Trivia · {trivia.difficulty}</h3>
            <p>
              {trivia.category === "all" ? "All topics" : trivia.category} ·
              Question {trivia.index + 1} of {trivia.ids.length} · Score{" "}
              {trivia.score}
            </p>
            <Link
              to={`/trivia?difficulty=${trivia.difficulty}&category=${trivia.category}`}
            >
              Resume trivia →
            </Link>
          </article>
        ) : null}
      </div>
      {!saved.items.length && !started.length && !trivia ? (
        <p>
          Save an exploration or <Link to="/learn">start a learning track</Link>{" "}
          to pick it up here.
        </p>
      ) : null}
    </section>
  );
}
