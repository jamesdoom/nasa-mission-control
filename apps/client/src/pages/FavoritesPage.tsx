import { Link } from "react-router-dom";
import { ApodPanel } from "../components/ApodPanel";
import { useFavorites } from "../hooks/useFavorites";

export function FavoritesPage() {
  const favorites = useFavorites();
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
      {favorites.favorites.length === 0 ? (
        <div className="empty-state">
          <span aria-hidden="true">✦</span>
          <h2>No discoveries logged yet</h2>
          <p>Save an Astronomy Picture of the Day and it will appear here.</p>
          <Link className="button" to="/apod">
            Explore the archive
          </Link>
        </div>
      ) : (
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
      )}
    </section>
  );
}
