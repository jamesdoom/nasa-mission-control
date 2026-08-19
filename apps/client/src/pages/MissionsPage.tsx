import { useSearchParams } from "react-router-dom";
import { MissionCard } from "../components/MissionCard";
import {
  missions,
  type MissionDestination,
  type MissionStatus,
  type MissionVehicle,
} from "../data/missions";

const destinations: (MissionDestination | "all")[] = [
  "all",
  "Moon",
  "Mars",
  "Sun",
  "Outer Solar System",
  "Universe",
];
const vehicles: (MissionVehicle | "all")[] = [
  "all",
  "crewed",
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
  const visible = missions.filter(
    (mission) =>
      (destination === "all" || mission.destination === destination) &&
      (vehicle === "all" || mission.vehicle === vehicle) &&
      (status === "all" || mission.status === status),
  );

  function update(key: "destination" | "vehicle" | "status", value: string) {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete(key);
    else next.set(key, value);
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
            Six journeys across six decades—assembled from source-checked NASA
            records and clearly separated from live telemetry.
          </p>
        </div>
        <aside>
          <strong>CURATED DATA</strong>
          <span>Last source review // 2026-08-19</span>
        </aside>
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
