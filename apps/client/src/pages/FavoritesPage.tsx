import { Link } from "react-router-dom";
import { ApodPanel } from "../components/ApodPanel";
import { AsteroidCard } from "../components/AsteroidCard";
import { useAsteroidFavorites } from "../hooks/useAsteroidFavorites";
import { useFavorites } from "../hooks/useFavorites";

export function FavoritesPage() {
  const favorites = useFavorites();
  const asteroidFavorites = useAsteroidFavorites();
  const isEmpty =
    favorites.favorites.length === 0 &&
    asteroidFavorites.favorites.length === 0;
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
          <p>Save an Astronomy Picture of the Day and it will appear here.</p>
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
    </section>
  );
}
