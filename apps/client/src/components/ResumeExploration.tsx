import { useResumeAnchor } from "../hooks/useResumeAnchor";
import { Link } from "react-router-dom";
import { useSavedExplorations } from "../hooks/useSavedExplorations";
import { readTriviaSession } from "../utils/triviaSession";

export function ResumeExploration() {
  useResumeAnchor();
  const saved = useSavedExplorations();
  const visibleSaved = saved.items.filter(
    (item) => !/^\/(learn|discover)([/?#]|$)/.test(item.path),
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
          <h2 id="resume-title">Resume exploration</h2>
        </div>
      </div>
      <p>
        Saved explorations keep their filters and return links. Trivia progress
        stays in this browser; live records may change.
      </p>
      <div className="saved-journey-grid">
        {visibleSaved.map((item) => (
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
      {!visibleSaved.length && !trivia ? (
        <p>
          Save an exploration or{" "}
          <Link to="/trivia">start a trivia session</Link> to pick it up here.
        </p>
      ) : null}
    </section>
  );
}
