import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Mission } from "../data/missions";

function MissionCardImage({ mission }: { mission: Mission }) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(image);
    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imageRef}
      src={
        shouldLoad ? `/assets/missions/cards/${mission.slug}.jpg` : undefined
      }
      alt={mission.image.alt}
      width="720"
      height="480"
      loading="lazy"
      decoding="async"
      fetchPriority="low"
    />
  );
}

export function MissionCard({ mission }: { mission: Mission }) {
  return (
    <article className="mission-card">
      <Link
        to={`/missions/${mission.slug}`}
        aria-label={`Open ${mission.name} mission archive`}
      >
        <div className="mission-card__image">
          <MissionCardImage mission={mission} />
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
