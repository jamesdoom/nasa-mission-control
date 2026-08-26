import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getMission, getMissionReviewDueDate } from "../data/missions";
import { NotFoundPage } from "./NotFoundPage";
import { useMissionFavorites } from "../hooks/useMissionFavorites";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import { ProvenancePanel } from "../components/ProvenancePanel";
import { getMissionEnrichment } from "../data/educationalEnrichment";

const missionDiscovery: Record<
  string,
  { journey: string; instrument: string; instrumentLabel: string }
> = {
  "apollo-11": {
    journey: "moon-then-now",
    instrument: "/earth",
    instrumentLabel: "View Earth from deep space",
  },
  "voyager-1": {
    journey: "sun-to-earth",
    instrument: "/space-weather",
    instrumentLabel: "Explore heliophysics observations",
  },
  curiosity: {
    journey: "mars-field-lab",
    instrument: "/media?q=Curiosity+Mars&mediaType=image&page=1",
    instrumentLabel: "Search Curiosity imagery",
  },
  perseverance: {
    journey: "mars-field-lab",
    instrument: "/media?q=Perseverance+Mars&mediaType=image&page=1",
    instrumentLabel: "Search Perseverance imagery",
  },
  "parker-solar-probe": {
    journey: "sun-to-earth",
    instrument: "/space-weather",
    instrumentLabel: "Open heliophysics observations",
  },
  webb: {
    journey: "deep-universe",
    instrument: "/apod",
    instrumentLabel: "Open today’s cosmic briefing",
  },
  hubble: {
    journey: "hubble-cosmic-scale",
    instrument: "/apod",
    instrumentLabel: "Open today’s cosmic briefing",
  },
  juno: {
    journey: "jupiter-beneath-clouds",
    instrument: "/media?q=Juno+Jupiter&mediaType=image&page=1",
    instrumentLabel: "Search Juno imagery",
  },
  cassini: {
    journey: "saturn-ocean-worlds",
    instrument: "/media?q=Cassini+Enceladus+Titan&mediaType=image&page=1",
    instrumentLabel: "Search Saturn-system imagery",
  },
  "artemis-i": {
    journey: "artemis-return-moon",
    instrument: "/earth",
    instrumentLabel: "View Earth from deep space",
  },
};

export function MissionDetailPage() {
  const mission = getMission(useParams().missionSlug);
  const favorites = useMissionFavorites();
  const recent = useRecentlyViewed();
  useEffect(() => {
    if (!mission) return;
    recent.record({
      kind: "mission",
      id: mission.slug,
      title: mission.name,
      path: `/missions/${mission.slug}`,
    });
  }, [mission, recent.record]);
  if (!mission) return <NotFoundPage />;
  const discovery = missionDiscovery[mission.slug];
  const enrichment = getMissionEnrichment(mission.slug);
  return (
    <>
      <article className="mission-detail">
        <header className="mission-detail__hero">
          <img src={mission.image.src} alt={mission.image.alt} />
          <div className="mission-detail__shade" />
          <div className="mission-detail__heading">
            <Link className="text-link" to="/missions">
              ← Mission Archive
            </Link>
            <p className="kicker">
              <span />
              {mission.missionNumber} // {mission.program}
            </p>
            <h1>{mission.name}</h1>
            <p>{mission.dek}</p>
            <div>
              <span
                className={`mission-status mission-status--${mission.status}`}
              >
                {mission.statusLabel}
              </span>
              <span>{mission.destination}</span>
              <span>{mission.vehicle}</span>
              <button
                className="mission-save"
                type="button"
                aria-pressed={favorites.isFavorite(mission.slug)}
                onClick={() => favorites.toggle(mission)}
              >
                {favorites.isFavorite(mission.slug)
                  ? "Remove from Flight Log"
                  : "Save to Flight Log"}
              </button>
            </div>
          </div>
          <p className="mission-detail__credit">
            Image: {mission.image.credit} //{" "}
            <a href={mission.image.sourceUrl} target="_blank" rel="noreferrer">
              NASA ID {mission.image.nasaId} ↗
            </a>
          </p>
        </header>
        <div className="section mission-detail__body">
          <ProvenancePanel
            kind="curated"
            title="Reviewed Mission Archive record"
            summary={`Source review ${mission.verifiedAt}`}
            details={[
              "This narrative is maintained locally and is not a live NASA mission-status feed.",
              `Its facts and timeline were last checked against the linked official NASA sources on ${mission.verifiedAt}.`,
              `The next scheduled review is due ${getMissionReviewDueDate(mission)}; source links remain available below for direct verification.`,
            ]}
          />
          <section className="mission-overview">
            <div>
              <p className="eyebrow">Mission brief</p>
              <h2>Why it mattered</h2>
              <p>{mission.overview}</p>
              <blockquote>{mission.objective}</blockquote>
            </div>
            <dl>
              {mission.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="mission-achievements">
            <p className="eyebrow">Selected achievements</p>
            <div>
              {mission.achievements.map((item, index) => (
                <article key={item}>
                  <span>0{index + 1}</span>
                  <p>{item}</p>
                </article>
              ))}
            </div>
          </section>
          {enrichment ? (
            <section
              className="mission-overview mission-overview--evidence"
              aria-labelledby="mission-evidence"
            >
              <div>
                <p className="eyebrow">Instruments and evidence</p>
                <h2 id="mission-evidence">
                  How the mission answered its question
                </h2>
                <dl>
                  {enrichment.instruments.map((instrument) => (
                    <div key={instrument.name}>
                      <dt>{instrument.name}</dt>
                      <dd>{instrument.purpose}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <h3>Results and continuing status</h3>
                <ul>
                  {enrichment.results.map((result) => (
                    <li key={result}>{result}</li>
                  ))}
                </ul>
                <p>
                  <strong>Status at the latest source review:</strong>{" "}
                  {enrichment.statusNote}
                </p>
              </div>
            </section>
          ) : null}
          {enrichment?.terms.length ? (
            <aside
              className="mission-sources mission-terms"
              aria-labelledby="mission-terms"
            >
              <div>
                <strong id="mission-terms">Terms used on this page</strong>
                <p>
                  Concise definitions preserve the limits of the scientific
                  claims above.
                </p>
              </div>
              <dl>
                {enrichment.terms.map((item) => (
                  <div key={item.term}>
                    <dt>{item.term}</dt>
                    <dd>{item.definition}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          ) : null}
          <section className="mission-timeline">
            <div className="section-heading">
              <div>
                <p className="kicker">
                  <span />
                  Mission chronology
                </p>
                <h2>Defining moments</h2>
              </div>
            </div>
            <ol>
              {mission.timeline.map((event) => (
                <li key={`${event.date}-${event.title}`}>
                  <time dateTime={event.date}>{event.date}</time>
                  <div>
                    <h3>{event.title}</h3>
                    <p>{event.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          {mission.relatedMedia ? (
            <section
              className="mission-related-media"
              aria-labelledby="related-mission-media"
            >
              <div className="section-heading">
                <div>
                  <p className="kicker">
                    <span />
                    Official NASA media
                  </p>
                  <h2 id="related-mission-media">
                    Continue through the record
                  </h2>
                </div>
              </div>
              <div>
                {mission.relatedMedia.map((item) => (
                  <a
                    key={item.url}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>{item.kind}</span>
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                    <small>Open official NASA source ↗</small>
                  </a>
                ))}
                <Link
                  to={`/media?q=${encodeURIComponent(mission.name)}&mediaType=image&page=1`}
                >
                  <span>archive search</span>
                  <strong>Search NASA’s media library</strong>
                  <p>
                    Find additional normalized image and video records connected
                    to {mission.name}.
                  </p>
                  <small>Open Mission Control media search →</small>
                </Link>
              </div>
            </section>
          ) : null}
          <aside className="mission-sources">
            <div>
              <strong>Curated record</strong>
              <p>
                This page is maintained locally, not generated from live
                telemetry. Status and facts were last checked against official
                NASA sources on {mission.verifiedAt}. The next scheduled status
                review is due by {getMissionReviewDueDate(mission)}.
              </p>
            </div>
            <ul>
              {mission.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </aside>
          {discovery ? (
            <section
              className="mission-discovery"
              aria-labelledby="continue-exploration"
            >
              <div>
                <p className="eyebrow">Continue the investigation</p>
                <h2 id="continue-exploration">
                  Connect this record to live Mission Control
                </h2>
                <p>
                  Move from this curated history into current observations and
                  primary NASA media without losing the scientific context.
                </p>
              </div>
              <div>
                <Link className="button" to={`/discover#${discovery.journey}`}>
                  Open guided path
                </Link>
                <Link
                  className="button button--secondary"
                  to={discovery.instrument}
                >
                  {discovery.instrumentLabel}
                </Link>
              </div>
            </section>
          ) : null}
        </div>
      </article>
    </>
  );
}
