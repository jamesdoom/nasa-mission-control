import type { Asteroid } from "@mission-control/shared";
import { Link } from "react-router-dom";
import { HeartIcon } from "./Icons";

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export function AsteroidCard({
  asteroid,
  saved,
  onToggle,
  detailQuery,
}: {
  asteroid: Asteroid;
  saved: boolean;
  onToggle: () => void;
  detailQuery: string;
}) {
  const averageDiameter =
    (asteroid.diameterMeters.min + asteroid.diameterMeters.max) / 2;
  const approachTime = `${new Date(
    asteroid.approach.dateTimeUtc,
  ).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  })} UTC`;
  return (
    <article className="asteroid-card">
      <div className="asteroid-card__header">
        <div>
          <span className="asteroid-id">NEO // {asteroid.id}</span>
          <h2>{asteroid.name}</h2>
        </div>
        <button
          className={saved ? "icon-button is-saved" : "icon-button"}
          type="button"
          aria-pressed={saved}
          aria-label={
            saved
              ? `Remove ${asteroid.name} from favorites`
              : `Save ${asteroid.name} to favorites`
          }
          onClick={onToggle}
        >
          <HeartIcon />
        </button>
      </div>
      <div
        className={
          asteroid.potentiallyHazardous
            ? "hazard-badge hazard-badge--watch"
            : "hazard-badge"
        }
      >
        <span />
        {asteroid.potentiallyHazardous
          ? "Potentially hazardous classification"
          : "No potentially hazardous classification"}
      </div>
      <dl className="asteroid-metrics">
        <div>
          <dt>Miss distance</dt>
          <dd>
            {decimal.format(asteroid.approach.missDistanceLunar)} LD
            <small>{number.format(asteroid.approach.missDistanceKm)} km</small>
          </dd>
        </div>
        <div>
          <dt>Relative velocity</dt>
          <dd>
            {number.format(asteroid.approach.velocityKph)} km/h
            <small>Relative to Earth</small>
          </dd>
        </div>
        <div>
          <dt>Estimated diameter</dt>
          <dd>
            ~{number.format(averageDiameter)} m
            <small>
              {number.format(asteroid.diameterMeters.min)}–
              {number.format(asteroid.diameterMeters.max)} m range
            </small>
          </dd>
        </div>
      </dl>
      <div className="asteroid-card__footer">
        <time dateTime={asteroid.approach.dateTimeUtc}>{approachTime}</time>
        <Link
          className="text-link"
          to={`/asteroids/${asteroid.id}?${detailQuery}`}
        >
          Open encounter →
        </Link>
      </div>
    </article>
  );
}
