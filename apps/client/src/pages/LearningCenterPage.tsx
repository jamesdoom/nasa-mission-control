import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { learningTrackById, learningTracks } from "../data/learningTracks";
import { useLearningProgress } from "../hooks/useLearningProgress";
import { learningEnrichment } from "../data/educationalEnrichment";

function download(name: string, content: string) {
  const url = URL.createObjectURL(
    new Blob([content], { type: "application/json" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function LearningCenterPage() {
  const [params, setParams] = useSearchParams();
  const track = learningTrackById(params.get("track") ?? undefined);
  const progress = useLearningProgress();
  const enrichment = learningEnrichment[track.id];
  const record = progress.tracks[track.id] ?? {
    completedSteps: [],
    checkPassed: false,
    reflection: "",
    updatedAt: "",
  };
  const [answer, setAnswer] = useState<number | null>(null);
  const [reflection, setReflection] = useState(record.reflection);
  const [status, setStatus] = useState("");
  useEffect(() => {
    setAnswer(null);
    setReflection(record.reflection);
    setStatus("");
  }, [track.id, record.reflection]);
  const complete =
    record.completedSteps.length === track.steps.length &&
    record.checkPassed &&
    Boolean(record.reflection);
  const completedTracks = learningTracks.filter((item) => {
    const value = progress.tracks[item.id];
    return Boolean(
      value?.completedSteps.length === item.steps.length &&
      value.checkPassed &&
      value.reflection,
    );
  }).length;
  return (
    <>
      <section className="section learning-intro">
        <p className="kicker">
          <span />
          Guided learning // Local progress
        </p>
        <div>
          <h1>Learning Center</h1>
          <p>
            Repeatable, source-backed sessions connecting science stories,
            mission records, NASA instruments, and knowledge checks.
          </p>
        </div>
        <aside>
          <strong>
            {completedTracks}/{learningTracks.length}
          </strong>
          <span>tracks complete in this browser</span>
        </aside>
      </section>
      <section
        className="section learning-controls"
        aria-labelledby="track-selector-title"
      >
        <div>
          <p className="eyebrow">Learning history stays on this device</p>
          <h2 id="track-selector-title">Choose a track</h2>
        </div>
        <label>
          Track
          <select
            value={track.id}
            onChange={(event) => setParams({ track: event.target.value })}
          >
            {learningTracks.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <div>
          <button
            type="button"
            className="button button--secondary"
            onClick={() =>
              download(
                "mission-control-learning-progress.json",
                progress.exportJson(),
              )
            }
          >
            Export learning progress
          </button>
          <button
            type="button"
            onClick={() => {
              progress.reset();
              setStatus("Learning progress reset in this browser.");
            }}
          >
            Reset all learning progress
          </button>
        </div>
        <p role="status">{status}</p>
      </section>
      <article className="section learning-track">
        <header>
          <p className="kicker">
            <span />
            {track.code}
          </p>
          <h2>{track.title}</h2>
          <p>
            <strong>Objective:</strong> {track.objective}
          </p>
          <p>
            {track.audience} · {track.duration}
          </p>
          <progress
            max={track.steps.length + 2}
            value={
              record.completedSteps.length +
              (record.checkPassed ? 1 : 0) +
              (record.reflection ? 1 : 0)
            }
          >
            {record.completedSteps.length} steps complete
          </progress>
        </header>
        <section aria-labelledby="learning-sequence-title">
          <h3 id="learning-sequence-title">Guided sequence</h3>
          <ol className="learning-sequence">
            {track.steps.map((step, index) => (
              <li key={step.id}>
                <div>
                  <span>{index + 1}</span>
                  <p className="eyebrow">{step.kind}</p>
                  <h4>{step.title}</h4>
                  <p>{step.instruction}</p>
                  <Link to={step.to}>Open learning resource →</Link>
                </div>
                <label>
                  <input
                    type="checkbox"
                    checked={record.completedSteps.includes(step.id)}
                    onChange={() => progress.toggleStep(track.id, step.id)}
                  />{" "}
                  Mark step complete
                </label>
              </li>
            ))}
          </ol>
        </section>
        <section
          className="knowledge-check"
          aria-labelledby="knowledge-check-title"
        >
          <p className="eyebrow">Source-backed knowledge check</p>
          <h3 id="knowledge-check-title">{track.check.prompt}</h3>
          <fieldset>
            <legend>Choose one answer</legend>
            {track.check.choices.map((choice, index) => (
              <label key={choice}>
                <input
                  type="radio"
                  name={`check-${track.id}`}
                  checked={answer === index}
                  onChange={() => setAnswer(index)}
                />{" "}
                {choice}
              </label>
            ))}
          </fieldset>
          <button
            className="button"
            type="button"
            disabled={answer === null}
            onClick={() => {
              if (answer === track.check.answer) progress.passCheck(track.id);
            }}
          >
            Check answer
          </button>
          {answer !== null ? (
            <div
              className={
                answer === track.check.answer
                  ? "knowledge-check__result is-correct"
                  : "knowledge-check__result"
              }
              role="status"
            >
              <strong>
                {answer === track.check.answer
                  ? "Correct."
                  : "Not yet—review the evidence and try again."}
              </strong>
              <p>{track.check.explanation}</p>
              <a href={track.check.source.url} target="_blank" rel="noreferrer">
                {track.check.source.label} ↗
              </a>
            </div>
          ) : null}
        </section>
        <section
          className="reflection-prompt"
          aria-labelledby="reflection-title"
        >
          <p className="eyebrow">Reflection</p>
          <h3 id="reflection-title">Explain the evidence in your own words</h3>
          <p>{track.reflection}</p>
          {enrichment ? <p>{enrichment.secondReflection}</p> : null}
          <label>
            Your response
            <textarea
              value={reflection}
              maxLength={1000}
              rows={5}
              onChange={(event) => setReflection(event.target.value)}
            />
          </label>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => {
              progress.saveReflection(track.id, reflection);
              setStatus("Reflection saved in this browser.");
            }}
          >
            Save reflection locally
          </button>
        </section>
        <section
          className="completion-summary"
          aria-labelledby="completion-title"
        >
          <p className="eyebrow">Completion summary</p>
          <h3 id="completion-title">
            {complete ? "Track complete" : "Continue the session"}
          </h3>
          <p>
            {complete
              ? (enrichment?.completion ??
                `You completed all resources, passed the knowledge check, and recorded a reflection for “${track.title}.”`)
              : `${String(record.completedSteps.length)} of ${String(track.steps.length)} resources complete · knowledge check ${record.checkPassed ? "passed" : "pending"} · reflection ${record.reflection ? "saved" : "pending"}.`}
          </p>
          <dl className="completion-summary__evidence">
            <div>
              <dt>Learning objective</dt>
              <dd>{track.objective}</dd>
            </div>
            <div>
              <dt>Resources reviewed</dt>
              <dd>
                {record.completedSteps.length} of {track.steps.length}
              </dd>
            </div>
            <div>
              <dt>Knowledge check</dt>
              <dd>{record.checkPassed ? "Passed" : "Not yet passed"}</dd>
            </div>
            <div>
              <dt>Evidence reflection</dt>
              <dd>{record.reflection ? "Saved locally" : "Not yet saved"}</dd>
            </div>
          </dl>
          {enrichment ? (
            <div>
              <h4>Terms to carry forward</h4>
              <dl className="completion-summary__evidence">
                {enrichment.terms.map((item) => (
                  <div key={item.term}>
                    <dt>{item.term}</dt>
                    <dd>{item.definition}</dd>
                  </div>
                ))}
              </dl>
              <p>Learning content source review: {enrichment.verifiedAt}</p>
            </div>
          ) : null}
          <p className="completion-summary__limit">
            Completion records participation in this guided activity. It is not
            a credential or a claim of scientific mastery.
          </p>
        </section>
        <section
          className="educator-guide"
          aria-labelledby="educator-guide-title"
        >
          <div>
            <p className="eyebrow">Educator format</p>
            <h3 id="educator-guide-title">Guided-session activity sheet</h3>
            <p>
              Use the objective as an opening prompt, assign pairs to compare
              two resources, then use the knowledge check for retrieval practice
              and the reflection for evidence-based discussion.
            </p>
          </div>
          <button
            className="button"
            type="button"
            onClick={() => window.print()}
          >
            Print activity
          </button>
          <dl>
            <div>
              <dt>Opening · 5 min</dt>
              <dd>
                Ask learners to define the key distinction in the objective.
              </dd>
            </div>
            <div>
              <dt>Investigation · 25–35 min</dt>
              <dd>
                Complete the four linked resources and record one
                source-supported observation from each.
              </dd>
            </div>
            <div>
              <dt>Check · 5 min</dt>
              <dd>
                Answer the knowledge check independently, then discuss the cited
                explanation.
              </dd>
            </div>
            <div>
              <dt>Reflection · 10 min</dt>
              <dd>Respond to the prompt using at least two sources.</dd>
            </div>
          </dl>
          <section
            className="educator-guide__worksheet"
            aria-labelledby="worksheet-title"
          >
            <h4 id="worksheet-title">Learner evidence sheet</h4>
            <p>
              Participant code (no name): <span aria-hidden="true" />
            </p>
            <p>
              Session date: <span aria-hidden="true" />
            </p>
            <ol>
              {track.steps.map((step) => (
                <li key={step.id}>
                  <strong>{step.title}:</strong> Record one observation and the
                  evidence that supports it.
                  <span aria-hidden="true" />
                </li>
              ))}
            </ol>
            <h4>Repeat-session retrieval</h4>
            <p>
              Before reopening the resources, explain the objective in your own
              words and identify one claim you can support with evidence.
            </p>
            <span className="worksheet-lines" aria-hidden="true" />
          </section>
          <h4>Official sources</h4>
          <ul>
            {track.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url}>{source.label}</a>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </>
  );
}
