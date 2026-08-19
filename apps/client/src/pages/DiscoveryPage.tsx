import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { discoveryJourneys } from "../data/journeys";

export function DiscoveryPage() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [hash]);
  return (
    <>
      <section className="section discovery-intro">
        <p className="kicker">
          <span />
          Guided exploration // Instrument 08
        </p>
        <h1>Follow the evidence across Mission Control</h1>
        <p>
          Live feeds answer what was observed. Mission records explain why it
          mattered. NASA’s media archive shows how the evidence was captured.
          Choose a flight path and move between all three.
        </p>
      </section>
      <section
        className="section discovery-grid"
        aria-label="Guided discovery paths"
      >
        {discoveryJourneys.map((journey) => (
          <article className="journey-card" id={journey.id} key={journey.id}>
            <header>
              <p className="eyebrow">{journey.code}</p>
              <h2>{journey.title}</h2>
              <p>{journey.summary}</p>
            </header>
            <ol>
              {journey.steps.map((step, index) => (
                <li key={step.to}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <small>{step.label}</small>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                    <Link to={step.to}>Open instrument →</Link>
                  </div>
                </li>
              ))}
            </ol>
            <footer>
              <p>{journey.outcome}</p>
              <a href={journey.source.url} target="_blank" rel="noreferrer">
                Verify context with {journey.source.label} ↗
              </a>
            </footer>
          </article>
        ))}
      </section>
    </>
  );
}
