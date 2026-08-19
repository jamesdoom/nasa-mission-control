import { useHealthStatus } from "../features/health/useHealthStatus";

export function AboutPage() {
  const health = useHealthStatus();
  return (
    <>
      <section className="section page-section about-hero">
        <div className="page-intro">
          <p className="kicker">
            <span />
            Mission profile
          </p>
          <h1>
            Space data,
            <br />
            made human.
          </h1>
          <p>
            NASA Mission Control is an independent full-stack portfolio project
            that turns public space data into an accessible, cinematic, and
            scientifically responsible command-center experience.
          </p>
        </div>
        <aside className="health-status" aria-labelledby="system-status-title">
          <p className="eyebrow">Production readiness check</p>
          <div>
            <span
              className={
                health.isSuccess
                  ? "status-dot"
                  : "status-dot status-dot--pending"
              }
              aria-hidden="true"
            />
            <div>
              <h2 id="system-status-title">
                {health.isPending
                  ? "Checking data link"
                  : health.isSuccess
                    ? "Mission Control API online"
                    : "Mission Control API unavailable"}
              </h2>
              <p>
                {health.isSuccess
                  ? `Verified ${new Date(health.data.checkedAt).toLocaleTimeString()}`
                  : health.isError
                    ? "The application shell remains available while the service reconnects."
                    : "Contacting the same-origin Express health endpoint…"}
              </p>
            </div>
          </div>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => void health.refetch()}
            disabled={health.isFetching}
          >
            {health.isFetching ? "Checking…" : "Run status check"}
          </button>
          <small>
            This verifies the application API—not the availability of every
            upstream NASA service.
          </small>
        </aside>
      </section>

      <section
        className="section case-study"
        aria-labelledby="case-study-title"
      >
        <header>
          <p className="kicker">
            <span />
            Portfolio case study
          </p>
          <h2 id="case-study-title">
            From unstable public data to a dependable learning experience
          </h2>
        </header>
        <div className="case-study__metrics" aria-label="Project scope">
          <div>
            <strong>08</strong>
            <span>Mission instruments</span>
          </div>
          <div>
            <strong>06</strong>
            <span>NASA data services</span>
          </div>
          <div>
            <strong>06</strong>
            <span>Curated mission records</span>
          </div>
          <div>
            <strong>0</strong>
            <span>Client-exposed API keys</span>
          </div>
        </div>
        <div className="case-study__grid">
          <article>
            <span>01 // Challenge</span>
            <h3>Public APIs are not product contracts</h3>
            <p>
              NASA services differ in schemas, latency, media behavior, and
              availability. Raw payloads would create a fragile interface and
              expose implementation details throughout the client.
            </p>
          </article>
          <article>
            <span>02 // Architecture</span>
            <h3>A typed server boundary</h3>
            <p>
              Express validates requests and important upstream responses,
              applies bounded caching and timeouts, then returns deliberately
              small shared models to React through TanStack Query.
            </p>
          </article>
          <article>
            <span>03 // Product judgment</span>
            <h3>Context before spectacle</h3>
            <p>
              Potential hazards, space-weather measurements, imagery dates,
              curated history, and upstream failures are labeled precisely so
              the visual design never overstates what NASA’s data means.
            </p>
          </article>
          <article>
            <span>04 // Quality</span>
            <h3>Evidence in every release</h3>
            <p>
              Strict TypeScript, linting, unit and accessibility coverage,
              Playwright journeys, responsive checks, and production builds are
              required before each phase reaches the deployed portfolio.
            </p>
          </article>
        </div>
      </section>

      <section
        className="section about-principles"
        aria-labelledby="principles-title"
      >
        <header>
          <p className="kicker">
            <span />
            Engineering principles
          </p>
          <h2 id="principles-title">
            Designed as a system, not a collection of demos
          </h2>
        </header>
        <div className="about-grid">
          <article>
            <span>01</span>
            <h3>Reliable by design</h3>
            <p>
              NASA responses are validated and translated before reaching the
              interface. Credentials remain server-side.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Science with context</h3>
            <p>
              Measurements are explained plainly, and live observations stay
              visibly separate from curated content.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Built for everyone</h3>
            <p>
              Keyboard navigation, readable contrast, semantic structure, and
              reduced motion are first-class requirements.
            </p>
          </article>
        </div>
      </section>

      <aside className="section source-note">
        <strong>Data attribution</strong>
        <p>
          Live content comes from official NASA services; source links, image
          credits, timestamps, and copyright are retained when provided. This
          project is not affiliated with or endorsed by NASA. Review the code on{" "}
          <a
            href="https://github.com/jamesdoom/nasa-mission-control"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </aside>
    </>
  );
}
