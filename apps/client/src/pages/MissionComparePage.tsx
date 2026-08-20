import { Link, useSearchParams } from "react-router-dom";
import { MissionComparisonPicker } from "../components/MissionComparisonPicker";
import { getMission, missions } from "../data/missions";
import {
  comparisonTimeline,
  missionSelectionFrom,
  toggleMissionSelection,
} from "../utils/missionComparison";

export function MissionComparePage() {
  const [params, setParams] = useSearchParams();
  const selectedSlugs = missionSelectionFrom(params.get("missions"));
  const selectedMissions = selectedSlugs
    .map(getMission)
    .filter((mission) => mission !== undefined);
  const timeline = comparisonTimeline(selectedMissions);

  function toggle(slug: string) {
    const next = toggleMissionSelection(selectedSlugs, slug);
    setParams(next.length > 0 ? { missions: next.join(",") } : {});
  }

  return (
    <>
      <section className="section mission-compare-intro">
        <Link className="back-link" to="/missions">
          ← Mission Archive
        </Link>
        <p className="kicker">
          <span />
          Cross-mission analysis // Instrument 09
        </p>
        <div>
          <h1>Mission comparison</h1>
          <p>
            Place source-checked mission records on one console and follow their
            defining events across a shared chronology.
          </p>
        </div>
        <aside>
          <strong>{selectedMissions.length}/3 aligned</strong>
          <span>Curated archive data // Not live telemetry</span>
        </aside>
      </section>
      <section
        className="section mission-compare-selection"
        aria-labelledby="comparison-selection-title"
      >
        <div className="section-heading">
          <div>
            <p className="kicker">
              <span />
              Record selector
            </p>
            <h2 id="comparison-selection-title">Choose the flight set</h2>
          </div>
          <p>The URL preserves this comparison for sharing or revisiting.</p>
        </div>
        <MissionComparisonPicker
          options={missions}
          selected={selectedSlugs}
          onToggle={toggle}
        />
      </section>
      {selectedMissions.length < 2 ? (
        <section className="section mission-compare-empty">
          <div className="state-panel">
            <div>
              <strong>Select at least two missions</strong>
              <p>
                The comparison matrix and merged timeline activate when two or
                three records are aligned.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section
            className="section mission-comparison"
            aria-labelledby="comparison-matrix-title"
          >
            <div className="section-heading">
              <div>
                <p className="kicker">
                  <span />
                  Flight profile matrix
                </p>
                <h2 id="comparison-matrix-title">Mission parameters</h2>
              </div>
            </div>
            <div
              className={
                selectedMissions.length === 2
                  ? "mission-comparison-grid mission-comparison-grid--2"
                  : "mission-comparison-grid"
              }
            >
              {selectedMissions.map((mission) => (
                <article key={mission.slug}>
                  <img
                    src={`/assets/missions/cards/${mission.slug}.jpg`}
                    alt={mission.image.alt}
                    width="720"
                    height="480"
                  />
                  <div>
                    <p className="eyebrow">{mission.missionNumber}</p>
                    <h3>{mission.name}</h3>
                    <span
                      className={`mission-status mission-status--${mission.status}`}
                    >
                      {mission.statusLabel}
                    </span>
                    <dl>
                      <div>
                        <dt>Program</dt>
                        <dd>{mission.program}</dd>
                      </div>
                      <div>
                        <dt>Destination</dt>
                        <dd>{mission.destination}</dd>
                      </div>
                      <div>
                        <dt>Vehicle</dt>
                        <dd>{mission.vehicle}</dd>
                      </div>
                      <div>
                        <dt>Launch</dt>
                        <dd>{mission.launchDate}</dd>
                      </div>
                    </dl>
                    <h4>Primary objective</h4>
                    <p>{mission.objective}</p>
                    <div className="mission-comparison__links">
                      <Link to={`/missions/${mission.slug}`}>
                        Open record →
                      </Link>
                      <a
                        href={mission.sources[0]?.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        NASA source ↗
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <section
            className="section comparison-timeline"
            aria-labelledby="comparison-timeline-title"
          >
            <div className="section-heading">
              <div>
                <p className="kicker">
                  <span />
                  Combined chronology
                </p>
                <h2 id="comparison-timeline-title">Across mission time</h2>
              </div>
              <p>{timeline.length} source-checked milestones in sequence.</p>
            </div>
            <ol>
              {timeline.map((event) => (
                <li key={`${event.missionSlug}-${event.date}-${event.title}`}>
                  <time dateTime={event.date}>{event.date}</time>
                  <div>
                    <Link to={`/missions/${event.missionSlug}`}>
                      {event.missionName}
                    </Link>
                    <h3>{event.title}</h3>
                    <p>{event.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </>
  );
}
