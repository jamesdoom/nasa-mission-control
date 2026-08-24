import { Link } from "react-router-dom";
import { useHealthStatus } from "../features/health/useHealthStatus";

const tourStops = [
  {
    signal: "01 // Live boundary",
    title: "Begin with today’s briefing",
    description:
      "See normalized APOD and near-Earth data arrive through a server-owned NASA connection with honest status labels.",
    to: "/",
    label: "Open Mission Control",
  },
  {
    signal: "02 // Scientific context",
    title: "Interrogate an approach",
    description:
      "Compare velocity, diameter, and miss distance without turning classification data into a danger claim.",
    to: "/asteroids",
    label: "Open Asteroid Watch",
  },
  {
    signal: "03 // Curated evidence",
    title: "Cross six decades of missions",
    description:
      "Filter ten reviewed missions, align timelines, and continue to official NASA evidence.",
    to: "/missions",
    label: "Open Mission Archive",
  },
  {
    signal: "04 // Connected learning",
    title: "Follow a discovery path",
    description:
      "Connect live instruments, mission history, and NASA media through one guided question.",
    to: "/discover",
    label: "Open Guided Discovery",
  },
  {
    signal: "05 // Resilient return",
    title: "Review your Flight Log",
    description:
      "Revisit saved records locally through an offline shell that never presents cached telemetry as current.",
    to: "/favorites",
    label: "Open Flight Log",
  },
] as const;

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
          <div className="about-hero__actions">
            <a className="button" href="#product-tour">
              Start the product tour
            </a>
            <a
              className="button button--secondary"
              href="https://github.com/jamesdoom/nasa-mission-control"
              target="_blank"
              rel="noreferrer"
            >
              Review the source ↗
            </a>
          </div>
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
            <strong>11</strong>
            <span>Connected instrument views</span>
          </div>
          <div>
            <strong>06</strong>
            <span>NASA data services</span>
          </div>
          <div>
            <strong>10</strong>
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
              NASA services differ in shape, latency, and availability. Raw
              payloads would make the client fragile.
            </p>
          </article>
          <article>
            <span>02 // Architecture</span>
            <h3>A typed server boundary</h3>
            <p>
              Express validates, times out, caches, and maps upstream data into
              small shared models for React.
            </p>
          </article>
          <article>
            <span>03 // Product judgment</span>
            <h3>Context before spectacle</h3>
            <p>
              Precise classifications, timestamps, and evidence labels keep the
              interface from overstating NASA data.
            </p>
          </article>
          <article>
            <span>04 // Quality</span>
            <h3>Evidence in every release</h3>
            <p>
              Strict types, accessibility tests, Playwright journeys, and
              production audits gate each release.
            </p>
          </article>
        </div>
        <div className="case-study__evidence">
          <figure className="architecture-diagram">
            <div className="section-heading">
              <div>
                <p className="eyebrow">System architecture</p>
                <h3>A deliberate boundary at every trust change</h3>
              </div>
            </div>
            <ol
              className="about-grid architecture-flow"
              aria-label="Mission Control data flow"
            >
              <li>
                <article>
                  <span>01</span>
                  <h4>React command console</h4>
                  <p>Routes, TanStack Query, local Flight Log</p>
                </article>
              </li>
              <li>
                <article>
                  <span>02</span>
                  <h4>Express control boundary</h4>
                  <p>Zod validation, timeouts, caching, normalized models</p>
                </article>
              </li>
              <li>
                <article>
                  <span>03</span>
                  <h4>Official NASA services</h4>
                  <p>Server-only key, media APIs, imagery, telemetry</p>
                </article>
              </li>
            </ol>
            <figcaption>
              Typed local modules provide curated records; live NASA response
              shapes never cross the server boundary.
            </figcaption>
          </figure>
          <section
            className="performance-evidence"
            aria-labelledby="performance-evidence-title"
          >
            <p className="eyebrow">Measured outcome</p>
            <h3 id="performance-evidence-title">
              More narrative, less initial payload
            </h3>
            <dl>
              <div>
                <dt>Mission Archive transfer</dt>
                <dd>
                  <strong>1.77 MB</strong>
                  <span aria-hidden="true">→</span>
                  <strong>0.86 MB</strong>
                </dd>
              </div>
              <div>
                <dt>Layout shift in audited routes</dt>
                <dd>
                  <strong>0 CLS</strong>
                </dd>
              </div>
              <div>
                <dt>Largest JavaScript ceiling</dt>
                <dd>
                  <strong>120 kB gzip</strong>
                </dd>
              </div>
            </dl>
            <p>
              Image derivatives, viewport gates, route chunks, and self-hosted
              fonts are enforced by repeatable audits.
            </p>
          </section>
        </div>
      </section>

      <section
        className="section product-tour"
        id="product-tour"
        aria-labelledby="product-tour-title"
      >
        <header>
          <p className="kicker">
            <span />
            Guided product tour // Five stops
          </p>
          <h2 id="product-tour-title">
            Follow the evidence through Mission Control
          </h2>
          <p>
            Each stop connects a product decision to a working instrument. Open
            one, then return through About for the next signal.
          </p>
        </header>
        <div className="about-grid product-tour__grid">
          {tourStops.map((stop) => (
            <article key={stop.to}>
              <span>{stop.signal}</span>
              <h3>{stop.title}</h3>
              <p>{stop.description}</p>
              <Link className="text-link" to={stop.to}>
                {stop.label} →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section
        className="section evidence-glossary"
        id="evidence-glossary"
        aria-labelledby="evidence-glossary-title"
      >
        <header>
          <p className="kicker">
            <span />
            Data literacy // Evidence key
          </p>
          <h2 id="evidence-glossary-title">How to read Mission Control</h2>
          <p>
            Instrument evidence panels use these terms consistently so current
            retrieval, historical observation, and project-authored context are
            never mistaken for one another.
          </p>
        </header>
        <dl>
          <div>
            <dt>NASA API</dt>
            <dd>
              A response retrieved from an official NASA service through the
              Mission Control server. It may still describe an older event.
            </dd>
          </div>
          <div>
            <dt>Retrieved</dt>
            <dd>
              When this browser received the normalized response—not when the
              spacecraft, telescope, or sensor made the observation.
            </dd>
          </div>
          <div>
            <dt>Observed</dt>
            <dd>
              The event or capture time supplied in the NASA record, normally
              shown in UTC when available.
            </dd>
          </div>
          <div>
            <dt>Curated</dt>
            <dd>
              Project-maintained educational material checked against linked
              official NASA sources on a recorded review date.
            </dd>
          </div>
          <div>
            <dt>Calculated</dt>
            <dd>
              A transparent local calculation made from displayed sourced
              values; its formula and limitations are stated beside the result.
            </dd>
          </div>
        </dl>
      </section>

      <section className="section case-study" aria-labelledby="release-title">
        <header>
          <p className="kicker">
            <span />
            Public release // Operating boundaries
          </p>
          <h2 id="release-title">Evidence, limitations, and user rights</h2>
          <p>
            Release documentation states what is monitored, what remains local,
            and where this educational project stops short of an operational
            service.
          </p>
        </header>
        <div className="case-study__grid">
          {(
            [
              ["Service limitations", "service-limitations.md"],
              ["Privacy notice", "privacy.md"],
              ["Accessibility status", "accessibility.md"],
              ["Incident and rollback procedures", "operations.md"],
              ["Public operational status", "public-status.md"],
              ["Release process and channels", "release-process.md"],
              ["Continuous improvement", "continuous-improvement.md"],
              ["Prioritized backlog", "improvement-backlog.md"],
            ] as const
          ).map(([label, document]) => (
            <article key={document}>
              <span>Release document</span>
              <h3>{label}</h3>
              <a
                className="text-link"
                href={`https://github.com/jamesdoom/nasa-mission-control/blob/main/docs/${document}`}
                target="_blank"
                rel="noreferrer"
              >
                Read the public document ↗
              </a>
            </article>
          ))}
        </div>
        <div className="about-hero__actions">
          <a
            className="button"
            href="https://github.com/jamesdoom/nasa-mission-control/issues/new?template=feedback.yml"
            target="_blank"
            rel="noreferrer"
          >
            Share product feedback ↗
          </a>
          <a
            className="button button--secondary"
            href="https://github.com/jamesdoom/nasa-mission-control/issues/new?template=accessibility.yml"
            target="_blank"
            rel="noreferrer"
          >
            Report an accessibility barrier ↗
          </a>
        </div>
        <p className="source-note">
          Reports are public. Please do not include personal information or
          private Flight Log content.
        </p>
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
