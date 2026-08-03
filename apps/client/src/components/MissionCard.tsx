import { Link } from "react-router-dom";
import type { Mission } from "../data/missions";

export function MissionCard({ mission }: { mission: Mission }) {
  return (
    <article className="mission-card">
      <Link
        to={`/missions/${mission.slug}`}
        aria-label={`Open ${mission.name} mission archive`}
      >
        <div className="mission-card__image">
          <img src={mission.image.src} alt={mission.image.alt} loading="lazy" />
          <span className={`mission-status mission-status--${mission.status}`}>
            {mission.statusLabel}
          </span>
        </div>
        <div className="mission-card__copy">
          <p className="eyebrow">
            <span>{mission.missionNumber}</span>
            <span>{mission.launchDate.slice(0, 4)}</span>
          </p>
          <h2>{mission.name}</h2>
          <p>{mission.dek}</p>
          <dl>
            <div>
              <dt>Destination</dt>
              <dd>{mission.destination}</dd>
            </div>
            <div>
              <dt>Vehicle</dt>
              <dd>{mission.vehicle}</dd>
            </div>
          </dl>
          <span className="text-link">Open mission record →</span>
        </div>
      </Link>
    </article>
  );
}
