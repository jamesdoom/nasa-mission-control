import { Link } from "react-router-dom";
import { ApodPanel } from "../components/ApodPanel";
import { AsteroidCard } from "../components/AsteroidCard";
import { MediaCard } from "../components/MediaCard";
import { MissionCard } from "../components/MissionCard";
import { useAsteroidFavorites } from "../hooks/useAsteroidFavorites";
import { useFavorites } from "../hooks/useFavorites";
import { useMediaFavorites } from "../hooks/useMediaFavorites";
import { useMissionFavorites } from "../hooks/useMissionFavorites";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";

export function FavoritesPage() {
  const favorites = useFavorites();
  const asteroidFavorites = useAsteroidFavorites();
  const missionFavorites = useMissionFavorites();
  const mediaFavorites = useMediaFavorites();
  const recent = useRecentlyViewed();
  const isEmpty =
    favorites.favorites.length === 0 &&
    asteroidFavorites.favorites.length === 0 &&
    missionFavorites.favorites.length === 0 &&
    mediaFavorites.favorites.length === 0;
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
      {asteroidFavorites.favorites.length > 0 && (
        <section className="flight-log-section">
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
        <section className="flight-log-section">
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
        <section className="flight-log-section">
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
        <section className="flight-log-section">
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
