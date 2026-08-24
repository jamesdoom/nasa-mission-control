import { Link, useSearchParams } from "react-router-dom";
import {
  localDiscoveryIndex,
  relatedDiscoveryResults,
} from "../data/discoveryIndex";

export function InvestigationPage() {
  const [params, setParams] = useSearchParams();
  const ids = (params.get("records") ?? "")
    .split(",")
    .filter(Boolean)
    .slice(0, 6);
  const records = ids
    .map((id) => localDiscoveryIndex.find((item) => item.id === id))
    .filter((item): item is (typeof localDiscoveryIndex)[number] =>
      Boolean(item),
    );
  const recommendations = relatedDiscoveryResults(records, 6);
  function setRecords(next: string[]) {
    const nextParams = new URLSearchParams(params);
    if (next.length) nextParams.set("records", next.join(","));
    else nextParams.delete("records");
    setParams(nextParams);
  }
  return (
    <>
      <section className="section search-intro">
        <p className="kicker">
          <span />
          Shareable investigation
        </p>
        <div>
          <h1>Investigation workspace</h1>
          <p>
            Combine missions, observation instruments, media archives, and
            science stories. Every selection remains in the URL.
          </p>
        </div>
        <aside>
          <strong>{records.length}</strong>
          <span>of 6 records selected</span>
        </aside>
      </section>
      <section
        className="section investigation-workspace"
        aria-labelledby="workspace-title"
      >
        <div className="section-heading">
          <div>
            <p className="kicker">
              <span />
              Evidence board
            </p>
            <h2 id="workspace-title">Selected records</h2>
          </div>
          <Link to={`/search?workspace=${ids.join(",")}`}>
            Add from search →
          </Link>
        </div>
        {records.length ? (
          <div className="discovery-results-grid">
            {records.map((record) => (
              <article className="discovery-result-card" key={record.id}>
                <span>{record.kind}</span>
                <h3>{record.title}</h3>
                <p>{record.description}</p>
                <div className="discovery-result-card__metadata">
                  <span>{record.metadata.destination}</span>
                  <span>{record.metadata.era}</span>
                  <span>{record.metadata.evidence}</span>
                </div>
                <Link to={record.to}>Open source record →</Link>
                <button
                  type="button"
                  onClick={() =>
                    setRecords(ids.filter((id) => id !== record.id))
                  }
                >
                  Remove
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>No records selected</h2>
            <p>
              Start with a mission, observation, media archive, or science
              story.
            </p>
            <Link className="button" to="/search">
              Search the index
            </Link>
          </div>
        )}
      </section>
      {records.length && recommendations.length ? (
        <section
          className="section investigation-recommendations"
          aria-labelledby="recommendations-title"
        >
          <div className="section-heading">
            <div>
              <p className="kicker">
                <span />
                Explicit metadata matches
              </p>
              <h2 id="recommendations-title">Related records</h2>
            </div>
          </div>
          <p>
            Recommendations use only shared destination, evidence, and topic
            labels—never behavior tracking.
          </p>
          <div className="discovery-results-grid">
            {recommendations.map(({ result, reasons }) => (
              <article className="discovery-result-card" key={result.id}>
                <span>{result.kind}</span>
                <h3>{result.title}</h3>
                <p>{result.description}</p>
                <ul>
                  {reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
                <button
                  className="button button--secondary"
                  type="button"
                  disabled={ids.length >= 6}
                  onClick={() => setRecords([...ids, result.id])}
                >
                  Add related record
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
