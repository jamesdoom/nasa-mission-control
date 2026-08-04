import { useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ApiError } from "../api/apod";
import { ErrorState, LoadingState } from "../components/AsyncState";
import { HeartIcon } from "../components/Icons";
import { useAsteroids } from "../features/asteroids/useAsteroids";
import { useAsteroidFavorites } from "../hooks/useAsteroidFavorites";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import { utcDate } from "../utils/dates";

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export function AsteroidDetailPage() {
  const { asteroidId = "" } = useParams();
  const [params] = useSearchParams();
  const startDate = params.get("startDate") ?? utcDate();
  const endDate = params.get("endDate") ?? utcDate(6);
  const query = useAsteroids(startDate, endDate);
  const favorites = useAsteroidFavorites();
  const recent = useRecentlyViewed();
  const error = query.error instanceof ApiError ? query.error : undefined;
  const asteroid = query.data?.asteroids.find((item) => item.id === asteroidId);
  const backQuery = new URLSearchParams({ startDate, endDate }).toString();
  useEffect(() => {
    if (!asteroid) return;
    recent.record({
      kind: "asteroid",
      id: asteroid.id,
      title: asteroid.name,
      path: `/asteroids/${asteroid.id}?${backQuery}`,
    });
  }, [asteroid, backQuery, recent.record]);

  if (query.isPending)
    return (
      <section className="section page-section">
        <LoadingState />
      </section>
    );
  if (query.isError)
    return (
      <section className="section page-section">
        <ErrorState
          message={error?.message ?? "The encounter could not be loaded."}
          requestId={error?.requestId}
          retry={() => void query.refetch()}
        />
      </section>
    );
  if (!asteroid)
    return (
      <section className="section empty-state">
        <span aria-hidden="true">404</span>
        <h1>Encounter not found</h1>
        <p>This object is not present in the selected observation window.</p>
        <Link className="button" to={`/asteroids?${backQuery}`}>
          Return to Asteroid Watch
        </Link>
      </section>
    );

  const saved = favorites.isFavorite(asteroid.id);
  const approachTime = `${new Date(
    asteroid.approach.dateTimeUtc,
  ).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  })} UTC`;
  return (
    <section className="section page-section encounter-page">
      <Link className="text-link" to={`/asteroids?${backQuery}`}>
        ← Back to encounter scan
      </Link>
      <div className="encounter-hero">
        <div>
          <p className="kicker">
            <span />
            NEO // {asteroid.id}
          </p>
          <h1>{asteroid.name}</h1>
          <p>
            Closest approach in the selected window: {asteroid.approach.date}.
            Measurements below are estimates from NASA’s Near Earth Object Web
            Service.
          </p>
        </div>
        <div className="encounter-orbit" aria-hidden="true">
          <span className="encounter-earth" />
          <span className="encounter-path" />
          <i />
        </div>
      </div>
      <div
        className={
          asteroid.potentiallyHazardous
            ? "encounter-status encounter-status--watch"
            : "encounter-status"
        }
      >
        <div>
          <small>NASA/JPL classification</small>
          <strong>
            {asteroid.potentiallyHazardous
              ? "Potentially hazardous asteroid"
              : "Not classified as potentially hazardous"}
          </strong>
        </div>
        <button
          className={
            saved ? "button encounter-save is-saved" : "button encounter-save"
          }
          type="button"
          aria-pressed={saved}
          onClick={() => favorites.toggle(asteroid)}
        >
          <HeartIcon /> {saved ? "Saved to Flight Log" : "Save to Flight Log"}
        </button>
      </div>
      <dl className="encounter-grid">
        <div>
          <dt>Miss distance</dt>
          <dd>{number.format(asteroid.approach.missDistanceKm)} km</dd>
          <p>
            {number.format(asteroid.approach.missDistanceLunar)} lunar distances
          </p>
        </div>
        <div>
          <dt>Relative velocity</dt>
          <dd>{number.format(asteroid.approach.velocityKph)} km/h</dd>
          <p>Speed relative to Earth at close approach</p>
        </div>
        <div>
          <dt>Estimated diameter</dt>
          <dd>
            {number.format(asteroid.diameterMeters.min)}–
            {number.format(asteroid.diameterMeters.max)} m
          </dd>
          <p>Brightness-based estimate, not a direct measurement</p>
        </div>
        <div>
          <dt>Approach time</dt>
          <dd>{approachTime}</dd>
          <p>Coordinated Universal Time</p>
        </div>
      </dl>
      <aside className="source-note">
        <strong>Classification context</strong>
        <p>
          “Potentially hazardous” is an orbital and size classification.
          NASA/JPL states that this potential does not mean the object will
          impact Earth. Continued observations improve orbit predictions.
        </p>
        <a
          className="text-link"
          href={asteroid.jplUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open NASA/JPL small-body record ↗
        </a>
      </aside>
    </section>
  );
}
