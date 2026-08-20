import { Link, useSearchParams } from "react-router-dom";
import { MissionCard } from "../components/MissionCard";
import { MissionComparisonPicker } from "../components/MissionComparisonPicker";
import { ProvenancePanel } from "../components/ProvenancePanel";
import {
  missionDestinations,
  missions,
  type MissionDestination,
  type MissionStatus,
  type MissionVehicle,
} from "../data/missions";
import {
  missionSelectionFrom,
  toggleMissionSelection,
} from "../utils/missionComparison";

const destinations: (MissionDestination | "all")[] = [
  "all",
  ...missionDestinations,
];
const vehicles: (MissionVehicle | "all")[] = [
  "all",
  "crewed",
  "spacecraft",
  "probe",
  "rover",
  "observatory",
];
const statuses: (MissionStatus | "all")[] = [
  "all",
  "active",
  "extended",
  "completed",
];

function validOption<T extends string>(
  value: string | null,
  options: readonly T[],
  fallback: T,
): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function MissionsPage() {
  const [params, setParams] = useSearchParams();
  const destination = validOption(
    params.get("destination"),
    destinations,
    "all",
  );
  const vehicle = validOption(params.get("vehicle"), vehicles, "all");
  const status = validOption(params.get("status"), statuses, "all");
  const compared = missionSelectionFrom(params.get("compare"));
  const visible = missions.filter(
    (mission) =>
      (destination === "all" || mission.destination === destination) &&
      (vehicle === "all" || mission.vehicle === vehicle) &&
      (status === "all" || mission.status === status),
  );
  const latestReview = missions.reduce(
    (latest, mission) =>
      mission.verifiedAt > latest ? mission.verifiedAt : latest,
    missions[0]?.verifiedAt ?? "",
  );

  function update(key: "destination" | "vehicle" | "status", value: string) {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete(key);
    else next.set(key, value);
    setParams(next);
  }

  function toggleComparison(slug: string) {
    const next = new URLSearchParams(params);
    const selection = toggleMissionSelection(compared, slug);
    if (selection.length > 0) next.set("compare", selection.join(","));
    else next.delete("compare");
    setParams(next);
  }

  return (
    <>
      <section className="section missions-intro">
        <p className="kicker">
          <span />
          Curated flight history // Instrument 06
        </p>
        <div>
          <h1>Mission Archive</h1>
          <p>
            Ten journeys across six decades—assembled from source-checked NASA
            records and clearly separated from live telemetry.
          </p>
        </div>
        <aside>
          <strong>CURATED DATA</strong>
          <span>Last source review // {latestReview}</span>
        </aside>
      </section>
      <section className="section provenance-section">
        <ProvenancePanel
          kind="curated"
          title="Source-checked editorial mission records"
          summary={`Latest scheduled source review ${latestReview}`}
          details={[
            "Mission records are maintained in this repository and are not a live NASA mission-status feed.",
            "Each record carries its own review date and links to the official NASA pages used to verify its claims.",
            "Active and extended labels describe status at the recorded review date and are checked by the scheduled mission-review workflow.",
          ]}
        />
      </section>
      <section
        className="section mission-destinations"
        aria-labelledby="destination-groups-title"
      >
        <div className="section-heading">
          <div>
            <p className="kicker">
              <span />
              Destination index
            </p>
            <h2 id="destination-groups-title">Explore by destination</h2>
          </div>
          <p>Choose a region to focus the archive.</p>
        </div>
        <div className="mission-destination-grid">
          {missionDestinations.map((item) => {
            const grouped = missions.filter(
              (mission) => mission.destination === item,
            );
            const operating = grouped.filter(
              (mission) => mission.status !== "completed",
            ).length;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={destination === item}
                onClick={() => update("destination", item)}
              >
                <span>{item}</span>
                <strong>{grouped.length}</strong>
                <small>
                  {operating} active or extended mission
                  {operating === 1 ? "" : "s"}
                </small>
              </button>
            );
          })}
        </div>
      </section>
      <section className="section mission-filter-section">
        <div className="mission-filters" aria-label="Mission filters">
          <label>
            Destination
            <select
              value={destination}
              onChange={(event) => update("destination", event.target.value)}
            >
              {destinations.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All destinations" : item}
                </option>
              ))}
            </select>
          </label>
          <label>
            Spacecraft type
            <select
              value={vehicle}
              onChange={(event) => update("vehicle", event.target.value)}
            >
              {vehicles.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All vehicles" : capitalize(item)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Mission status
            <select
              value={status}
              onChange={(event) => update("status", event.target.value)}
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All statuses" : capitalize(item)}
                </option>
              ))}
            </select>
          </label>
          <span>
            <strong>{visible.length}</strong> mission
            {visible.length === 1 ? "" : "s"} in view
          </span>
        </div>
      </section>
      <section
        className="section mission-compare-console"
        aria-labelledby="comparison-channel-title"
      >
        <div className="mission-compare-console__heading">
          <div>
            <p className="kicker">
              <span />
              Comparison channel
            </p>
            <h2 id="comparison-channel-title">Align mission records</h2>
            <p>
              Select up to three missions currently in view, then compare their
              objectives, flight profiles, and defining moments.
            </p>
          </div>
          <div>
            <strong>{compared.length}/3 selected</strong>
            {compared.length >= 2 ? (
              <Link
                className="button"
                to={`/missions/compare?${new URLSearchParams({
                  missions: compared.join(","),
                }).toString()}`}
              >
                Open comparison
              </Link>
            ) : (
              <span>Select at least two missions</span>
            )}
            {compared.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  const next = new URLSearchParams(params);
                  next.delete("compare");
                  setParams(next);
                }}
              >
                Clear selection
              </button>
            ) : null}
          </div>
        </div>
        <MissionComparisonPicker
          options={visible}
          selected={compared}
          onToggle={toggleComparison}
        />
      </section>
      <section className="section mission-results" aria-live="polite">
        {visible.length === 0 ? (
          <div className="state-panel">
            <div>
              <strong>No missions match this telemetry profile</strong>
              <p>Adjust one or more archive filters.</p>
            </div>
          </div>
        ) : (
          <div className="mission-grid">
            {visible.map((mission) => (
              <MissionCard key={mission.slug} mission={mission} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
