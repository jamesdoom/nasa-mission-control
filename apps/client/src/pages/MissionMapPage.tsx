import { Link, useSearchParams } from "react-router-dom";
import { ProvenancePanel } from "../components/ProvenancePanel";
import {
  getMissionMapGroup,
  missionMapGroups,
  type MissionMapGroup,
} from "../data/solarSystemMap";

function DestinationControl({
  group,
  selected,
  onSelect,
}: {
  group: MissionMapGroup;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`mission-map-node mission-map-node--${group.color}`}
      style={{ left: `${String(group.x)}%`, top: `${String(group.y)}%` }}
      type="button"
      aria-pressed={selected}
      aria-label={`${group.id}: ${String(group.missions.length)} archive mission${group.missions.length === 1 ? "" : "s"}`}
      onClick={onSelect}
    >
      <span aria-hidden="true" />
      <strong>{group.shortLabel}</strong>
      <small>
        {group.missions.length} mission{group.missions.length === 1 ? "" : "s"}
      </small>
    </button>
  );
}

export function MissionMapPage() {
  const [params, setParams] = useSearchParams();
  const selected = getMissionMapGroup(params.get("destination"));
  const visibleGroups = selected ? [selected] : missionMapGroups;

  function selectDestination(group: MissionMapGroup) {
    const next = new URLSearchParams(params);
    if (selected?.id === group.id) next.delete("destination");
    else next.set("destination", group.id);
    setParams(next);
  }

  const visibleCount = visibleGroups.reduce(
    (count, group) => count + group.missions.length,
    0,
  );

  return (
    <>
      <section className="section mission-map-intro">
        <p className="kicker">
          <span />
          Flight geography // Instrument 11
        </p>
        <div>
          <h1>Solar-system mission map</h1>
          <p>
            Trace ten source-checked missions from launch to lunar, planetary,
            heliophysics, and observatory destinations.
          </p>
        </div>
        <aside>
          <strong>10 MISSIONS</strong>
          <span>Five destination regions</span>
        </aside>
      </section>

      <section className="section provenance-section">
        <ProvenancePanel
          kind="curated"
          title="Schematic mission geography"
          summary="Built from the reviewed Mission Archive"
          details={[
            "Positions and orbit lines are a navigational diagram, not a scale model or current spacecraft ephemeris.",
            "The observatory region groups Earth-orbiting Hubble with Webb at Sun–Earth L2 because both archive records study the wider universe.",
            "Mission milestones, status labels, review dates, and official sources come directly from each curated archive record.",
          ]}
        />
      </section>

      <section
        className="section mission-map-console"
        aria-labelledby="map-title"
      >
        <div className="section-heading">
          <div>
            <p className="kicker">
              <span />
              Destination plot
            </p>
            <h2 id="map-title">Choose a region</h2>
          </div>
          {selected ? (
            <button
              type="button"
              className="text-button"
              onClick={() => setParams({})}
            >
              Show all destinations
            </button>
          ) : (
            <p>Keyboard-operable controls overlay a decorative orbit plot.</p>
          )}
        </div>
        <div className="mission-map-plot">
          <svg
            viewBox="0 0 1000 500"
            role="img"
            aria-label="Schematic orbit paths extending from Earth toward five mission destination regions"
            preserveAspectRatio="none"
          >
            <path d="M250 270 C270 140 340 110 460 330" />
            <path d="M250 270 C340 450 510 370 690 155" />
            <path d="M250 270 C430 30 680 65 875 315" />
            <path d="M250 270 C180 270 135 270 80 270" />
            <circle cx="250" cy="270" r="62" />
            <circle cx="250" cy="270" r="108" />
            <circle cx="250" cy="270" r="178" />
          </svg>
          <div className="mission-map-origin" aria-hidden="true">
            <span />
            <small>Launch origin</small>
            <strong>EARTH</strong>
          </div>
          {missionMapGroups.map((group) => (
            <DestinationControl
              key={group.id}
              group={group}
              selected={selected?.id === group.id}
              onSelect={() => selectDestination(group)}
            />
          ))}
          <p className="mission-map-scale-note">
            NOT TO SCALE // NO LIVE POSITION DATA
          </p>
        </div>
      </section>

      <section
        className="section mission-map-records"
        aria-labelledby="mapped-records-title"
      >
        <div className="section-heading">
          <div>
            <p className="kicker">
              <span />
              Structured map alternative
            </p>
            <h2 id="mapped-records-title">
              {selected ? selected.id : "All destination records"}
            </h2>
          </div>
          <p aria-live="polite">{visibleCount} missions displayed</p>
        </div>
        <div className="mission-map-groups">
          {visibleGroups.map((group) => (
            <article key={group.id} className="mission-map-group">
              <header>
                <div>
                  <span>
                    DESTINATION // {String(group.orbit + 1).padStart(2, "0")}
                  </span>
                  <h3>{group.id}</h3>
                  <p>{group.context}</p>
                </div>
                <dl>
                  <div>
                    <dt>Missions</dt>
                    <dd>{group.missions.length}</dd>
                  </div>
                  <div>
                    <dt>Milestones</dt>
                    <dd>{group.milestoneCount}</dd>
                  </div>
                </dl>
              </header>
              <ol>
                {group.missions.map((mission) => {
                  const definingMilestone =
                    mission.timeline[1] ?? mission.timeline[0];
                  return (
                    <li key={mission.slug}>
                      <div>
                        <time dateTime={mission.launchDate}>
                          {mission.launchDate.slice(0, 4)}
                        </time>
                        <span>{mission.statusLabel}</span>
                      </div>
                      <h4>{mission.name}</h4>
                      {definingMilestone ? (
                        <p>
                          <strong>{definingMilestone.title}</strong> //{" "}
                          {definingMilestone.description}
                        </p>
                      ) : null}
                      <Link to={`/missions/${mission.slug}`}>
                        Open mission record →
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
