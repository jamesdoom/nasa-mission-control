import { useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { ApodPanel } from "../components/ApodPanel";
import { AsteroidCard } from "../components/AsteroidCard";
import { MediaCard } from "../components/MediaCard";
import { MissionCard } from "../components/MissionCard";
import { useAsteroidFavorites } from "../hooks/useAsteroidFavorites";
import { useFavorites } from "../hooks/useFavorites";
import { useJourneyFavorites } from "../hooks/useJourneyFavorites";
import { useMediaFavorites } from "../hooks/useMediaFavorites";
import { useMissionFavorites } from "../hooks/useMissionFavorites";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import {
  createFlightLogBackup,
  restoreFlightLogBackup,
} from "../utils/flightLogBackup";

export function FavoritesPage() {
  const favorites = useFavorites();
  const asteroidFavorites = useAsteroidFavorites();
  const missionFavorites = useMissionFavorites();
  const mediaFavorites = useMediaFavorites();
  const journeyFavorites = useJourneyFavorites();
  const recent = useRecentlyViewed();
  const [backupStatus, setBackupStatus] = useState("");
  const isEmpty =
    favorites.favorites.length === 0 &&
    asteroidFavorites.favorites.length === 0 &&
    missionFavorites.favorites.length === 0 &&
    mediaFavorites.favorites.length === 0 &&
    journeyFavorites.favorites.length === 0;
  const savedCount =
    favorites.favorites.length +
    asteroidFavorites.favorites.length +
    missionFavorites.favorites.length +
    mediaFavorites.favorites.length +
    journeyFavorites.favorites.length;
  const sections = [
    {
      id: "journeys",
      label: "Guided paths",
      count: journeyFavorites.favorites.length,
    },
    {
      id: "asteroids",
      label: "Asteroids",
      count: asteroidFavorites.favorites.length,
    },
    {
      id: "missions",
      label: "Missions",
      count: missionFavorites.favorites.length,
    },
    {
      id: "media",
      label: "NASA media",
      count: mediaFavorites.favorites.length,
    },
    { id: "apod", label: "APOD", count: favorites.favorites.length },
  ];

  function downloadBackup(): void {
    const blob = new Blob([createFlightLogBackup(localStorage)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `mission-control-flight-log-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setBackupStatus("Flight Log backup downloaded.");
  }

  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const restored = restoreFlightLogBackup(await file.text(), localStorage);
      setBackupStatus(
        `Restored ${String(restored)} Flight Log records. Reloading…`,
      );
      window.setTimeout(() => window.location.reload(), 400);
    } catch (error) {
      setBackupStatus(
        error instanceof Error
          ? error.message
          : "The backup could not be restored.",
      );
    }
  }
  return (
    <section className="section page-section">
      <div className="page-intro">
        <p className="kicker">
          <span />
          Personal flight log
        </p>
        <h1>Saved discoveries</h1>
        <p>Your favorite observations are stored only in this browser.</p>
      </div>
      <section
        className="flight-log-console"
        aria-labelledby="flight-log-summary"
      >
        <div>
          <p className="eyebrow">Local archive status</p>
          <h2 id="flight-log-summary">
            {savedCount} saved {savedCount === 1 ? "record" : "records"}
          </h2>
          <p>
            Jump to a collection or create a portable backup. Imports replace
            matching browser-local records only; no data is uploaded.
          </p>
        </div>
        <nav aria-label="Saved Flight Log collections">
          {sections.map((section) =>
            section.count > 0 ? (
              <a href={`#${section.id}`} key={section.id}>
                <span>{section.label}</span>
                <strong>{String(section.count).padStart(2, "0")}</strong>
              </a>
            ) : null,
          )}
        </nav>
        <div className="flight-log-backup">
          <button
            className="button button--secondary"
            type="button"
            onClick={downloadBackup}
          >
            Export backup
          </button>
          <label
            className="button button--secondary"
            htmlFor="flight-log-import"
          >
            Import backup
          </label>
          <input
            className="sr-only"
            id="flight-log-import"
            type="file"
            accept="application/json,.json"
            onChange={(event) => void importBackup(event)}
          />
          <p role="status" aria-live="polite">
            {backupStatus}
          </p>
        </div>
      </section>
      {isEmpty ? (
        <div className="empty-state">
          <span aria-hidden="true">✦</span>
          <h2>No discoveries logged yet</h2>
          <p>
            Save an observation, tracked object, mission, or NASA media asset
            and it will appear here.
          </p>
          <Link className="button" to="/apod">
            Explore the archive
          </Link>
        </div>
      ) : null}
      {journeyFavorites.favorites.length > 0 && (
        <section className="flight-log-section" id="journeys">
          <div className="section-heading">
            <div>
              <p className="kicker">
                <span />
                Saved investigations
              </p>
              <h2>Guided discovery paths</h2>
            </div>
          </div>
          <div className="saved-journey-grid">
            {journeyFavorites.favorites.map((journey) => (
              <article key={journey.id}>
                <p className="eyebrow">{journey.code}</p>
                <h3>{journey.title}</h3>
                <p>{journey.summary}</p>
                <div>
                  <Link to={`/discover#${journey.id}`}>Resume path →</Link>
                  <button
                    type="button"
                    onClick={() => journeyFavorites.toggle(journey)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      {asteroidFavorites.favorites.length > 0 && (
        <section className="flight-log-section" id="asteroids">
          <div className="section-heading">
            <div>
              <p className="kicker">
                <span />
                Tracked objects
              </p>
              <h2>Asteroid encounters</h2>
            </div>
          </div>
          <div className="asteroid-list">
            {asteroidFavorites.favorites.map((asteroid) => (
              <AsteroidCard
                key={asteroid.id}
                asteroid={asteroid}
                saved
                onToggle={() => asteroidFavorites.toggle(asteroid)}
                detailQuery={new URLSearchParams({
                  startDate: asteroid.approach.date,
                  endDate: asteroid.approach.date,
                }).toString()}
              />
            ))}
          </div>
        </section>
      )}
      {missionFavorites.favorites.length > 0 && (
        <section className="flight-log-section" id="missions">
          <div className="section-heading">
            <div>
              <p className="kicker">
                <span />
                Pinned flight history
              </p>
              <h2>Mission records</h2>
            </div>
          </div>
          <div className="mission-grid">
            {missionFavorites.favorites.map((mission) => (
              <div className="flight-log-saved-card" key={mission.slug}>
                <MissionCard mission={mission} />
                <button
                  type="button"
                  onClick={() => missionFavorites.toggle(mission)}
                  aria-label={`Remove ${mission.name} from Flight Log`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
      {mediaFavorites.favorites.length > 0 && (
        <section className="flight-log-section" id="media">
          <div className="section-heading">
            <div>
              <p className="kicker">
                <span />
                Saved NASA assets
              </p>
              <h2>Media discoveries</h2>
            </div>
          </div>
          <div className="media-grid">
            {mediaFavorites.favorites.map((item) => (
              <div className="flight-log-saved-card" key={item.nasaId}>
                <MediaCard item={item} />
                <button
                  type="button"
                  onClick={() => mediaFavorites.toggle(item)}
                  aria-label={`Remove ${item.title} from Flight Log`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
      {favorites.favorites.length > 0 && (
        <section className="flight-log-section" id="apod">
          <div className="section-heading">
            <div>
              <p className="kicker">
                <span />
                Saved observations
              </p>
              <h2>APOD discoveries</h2>
            </div>
          </div>
          <div className="favorites-grid">
            {favorites.favorites.map((apod) => (
              <ApodPanel
                key={apod.date}
                apod={apod}
                saved
                onToggle={() => favorites.toggle(apod)}
                compact
              />
            ))}
          </div>
        </section>
      )}
      {recent.items.length > 0 && (
        <section className="flight-log-section recent-history">
          <div className="section-heading">
            <div>
              <p className="kicker">
                <span />
                Navigation history
              </p>
              <h2>Recently viewed</h2>
            </div>
            <button
              className="button button--secondary"
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    "Clear recently viewed history from this browser?",
                  )
                )
                  recent.clear();
              }}
            >
              Clear history
            </button>
          </div>
          <ol>
            {recent.items.map((item) => (
              <li key={`${item.kind}-${item.id}`}>
                <span>{item.kind}</span>
                <Link to={item.path}>{item.title}</Link>
                <time dateTime={item.viewedAt}>
                  {new Date(item.viewedAt).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ol>
        </section>
      )}
    </section>
  );
}
