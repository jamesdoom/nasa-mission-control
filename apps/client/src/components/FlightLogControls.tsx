import type {
  FlightLogCollection,
  FlightLogSort,
} from "../utils/flightLogFilters";

const collections: FlightLogCollection[] = [
  "all",
  "journeys",
  "asteroids",
  "missions",
  "media",
  "apod",
];

const labels: Record<FlightLogCollection, string> = {
  all: "All records",
  journeys: "Guided paths",
  asteroids: "Asteroids",
  missions: "Missions",
  media: "NASA media",
  apod: "APOD",
};

type FlightLogControlsProps = {
  query: string;
  collection: FlightLogCollection;
  sort: FlightLogSort;
  savedCount: number;
  visibleCount: number;
  counts: Record<FlightLogCollection, number>;
  onQueryChange: (query: string) => void;
  onCollectionChange: (collection: FlightLogCollection) => void;
  onSortChange: (sort: FlightLogSort) => void;
  onClear: () => void;
};

export function FlightLogControls({
  query,
  collection,
  sort,
  savedCount,
  visibleCount,
  counts,
  onQueryChange,
  onCollectionChange,
  onSortChange,
  onClear,
}: FlightLogControlsProps) {
  const hasActiveControls =
    query.length > 0 || collection !== "all" || sort !== "default";

  return (
    <section className="flight-log-tools" aria-labelledby="archive-tools">
      <div className="flight-log-tools__heading">
        <div>
          <p className="eyebrow">Archive controls</p>
          <h2 id="archive-tools">Organize saved records</h2>
        </div>
        <p role="status" aria-live="polite">
          Showing {visibleCount} of {savedCount}
        </p>
      </div>
      <div className="flight-log-tools__controls">
        <label className="flight-log-search">
          <span>Search saved records</span>
          <input
            type="search"
            value={query}
            placeholder="Mission, object, topic…"
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>
        <label className="flight-log-sort">
          <span>Sort records</span>
          <select
            value={sort}
            onChange={(event) =>
              onSortChange(event.target.value as FlightLogSort)
            }
          >
            <option value="default">Saved order</option>
            <option value="az">Title A–Z</option>
            <option value="za">Title Z–A</option>
          </select>
        </label>
      </div>
      <fieldset className="flight-log-collections">
        <legend>Collection type</legend>
        {collections.map((item) => (
          <label key={item}>
            <input
              type="radio"
              name="flight-log-collection"
              checked={collection === item}
              onChange={() => onCollectionChange(item)}
            />
            <span>
              {labels[item]}
              <strong>{counts[item]}</strong>
            </span>
          </label>
        ))}
      </fieldset>
      {hasActiveControls && visibleCount > 0 ? (
        <button className="flight-log-clear" type="button" onClick={onClear}>
          Clear archive controls
        </button>
      ) : null}
    </section>
  );
}
