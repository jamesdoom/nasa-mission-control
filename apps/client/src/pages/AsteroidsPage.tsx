import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Asteroid } from "@mission-control/shared";
import { ApiError } from "../api/apod";
import { AsteroidCard } from "../components/AsteroidCard";
import { ErrorState, LoadingState } from "../components/AsyncState";
import { useAsteroids } from "../features/asteroids/useAsteroids";
import { useAsteroidFavorites } from "../hooks/useAsteroidFavorites";
import { utcDate } from "../utils/dates";

type SortMode = "closest" | "largest" | "fastest";
const sortModes: SortMode[] = ["closest", "largest", "fastest"];

function sortAsteroids(items: Asteroid[], mode: SortMode): Asteroid[] {
  return [...items].sort((first, second) => {
    if (mode === "largest")
      return second.diameterMeters.max - first.diameterMeters.max;
    if (mode === "fastest")
      return second.approach.velocityKph - first.approach.velocityKph;
    return first.approach.missDistanceKm - second.approach.missDistanceKm;
  });
}

export function AsteroidsPage() {
  const [params, setParams] = useSearchParams();
  const startDate = params.get("startDate") ?? utcDate();
  const endDate = params.get("endDate") ?? utcDate(6);
  const requestedSort = params.get("sort") as SortMode | null;
  const sort =
    requestedSort && sortModes.includes(requestedSort)
      ? requestedSort
      : "closest";
  const [draftStart, setDraftStart] = useState(startDate);
  const [draftEnd, setDraftEnd] = useState(endDate);
  useEffect(() => {
    setDraftStart(startDate);
    setDraftEnd(endDate);
  }, [startDate, endDate]);
  const query = useAsteroids(startDate, endDate);
  const favorites = useAsteroidFavorites();
  const error = query.error instanceof ApiError ? query.error : undefined;
  const asteroids = useMemo(
    () => sortAsteroids(query.data?.asteroids ?? [], sort),
    [query.data?.asteroids, sort],
  );
  const detailQuery = new URLSearchParams({ startDate, endDate }).toString();

  return (
    <section className="section page-section asteroid-page">
      <div className="page-intro asteroid-intro">
        <p className="kicker">
          <span />
          Instrument 02
        </p>
        <h1>
          Asteroid
          <br />
          Watch
        </h1>
        <p>
          Track near-Earth object approaches using NASA/JPL data. Distances and
          classifications describe observed orbits—they are not impact
          predictions.
        </p>
      </div>

      <form
        className="asteroid-console"
        onSubmit={(event) => {
          event.preventDefault();
          setParams({ startDate: draftStart, endDate: draftEnd, sort });
        }}
      >
        <label>
          Start date
          <input
            type="date"
            value={draftStart}
            onChange={(event) => setDraftStart(event.target.value)}
            required
          />
        </label>
        <label>
          End date
          <input
            type="date"
            value={draftEnd}
            min={draftStart}
            onChange={(event) => setDraftEnd(event.target.value)}
            required
          />
        </label>
        <label>
          Sort encounters
          <select
            value={sort}
            onChange={(event) =>
              setParams({
                startDate,
                endDate,
                sort: event.target.value as SortMode,
              })
            }
          >
            <option value="closest">Closest approach</option>
            <option value="largest">Largest estimate</option>
            <option value="fastest">Highest velocity</option>
          </select>
        </label>
        <button className="button" type="submit">
          Update scan
        </button>
        <small>NASA NeoWs supports ranges no more than seven days apart.</small>
      </form>

      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState
          message={
            error?.message ?? "An unexpected asteroid feed error occurred."
          }
          requestId={error?.requestId}
          retry={() => void query.refetch()}
        />
      ) : (
        <>
          <div className="asteroid-summary" aria-label="Encounter summary">
            <div>
              <small>Objects detected</small>
              <strong>{query.data.totalCount}</strong>
            </div>
            <div>
              <small>Potentially hazardous</small>
              <strong
                className={
                  query.data.potentiallyHazardousCount ? "amber" : "nominal"
                }
              >
                {query.data.potentiallyHazardousCount}
              </strong>
            </div>
            <div>
              <small>Closest approach</small>
              <strong>
                {query.data.closestApproachKm === null
                  ? "—"
                  : `${new Intl.NumberFormat("en-US", {
                      maximumFractionDigits: 0,
                    }).format(query.data.closestApproachKm)} km`}
              </strong>
            </div>
            <div>
              <small>Observation window</small>
              <strong>
                {startDate} → {endDate}
              </strong>
            </div>
          </div>

          <aside className="hazard-note">
            <span aria-hidden="true">i</span>
            <div>
              <strong>
                Potentially hazardous does not mean dangerous today.
              </strong>
              <p>
                NASA/JPL uses this classification for objects large enough and
                with orbits that can pass within 0.05 astronomical units of
                Earth’s orbit. It does not mean an impact is predicted.
              </p>
            </div>
          </aside>

          {asteroids.length === 0 ? (
            <div className="empty-state asteroid-empty">
              <span aria-hidden="true">0</span>
              <h2>No approaches in this window</h2>
              <p>Try another date range to continue the scan.</p>
            </div>
          ) : (
            <div className="asteroid-list">
              {asteroids.map((asteroid) => (
                <AsteroidCard
                  key={`${asteroid.id}-${asteroid.approach.dateTimeUtc}`}
                  asteroid={asteroid}
                  saved={favorites.isFavorite(asteroid.id)}
                  onToggle={() => favorites.toggle(asteroid)}
                  detailQuery={detailQuery}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
