import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../api/apod";
import { ApodPanel } from "../components/ApodPanel";
import { ErrorState, LoadingState } from "../components/AsyncState";
import { DataStatus } from "../components/DataStatus";
import { useApod } from "../features/apod/useApod";
import { useAsteroids } from "../features/asteroids/useAsteroids";
import { useFavorites } from "../hooks/useFavorites";
import { utcDate } from "../utils/dates";

export function DashboardPage() {
  const query = useApod();
  const asteroidQuery = useAsteroids(utcDate(), utcDate(6));
  const favorites = useFavorites();
  const error = query.error instanceof ApiError ? query.error : undefined;
  return (
    <>
      <section className="hero section">
        <div className="hero-immersion" aria-hidden="true">
          <span className="hero-immersion__stars hero-immersion__stars--near" />
          <span className="hero-immersion__stars hero-immersion__stars--far" />
          <span className="hero-immersion__horizon" />
          <span className="hero-immersion__scan" />
        </div>
        <div className="hero-grid">
          <div>
            <p className="kicker">
              <span />
              Live orbital briefing
            </p>
            <h1>
              Explore beyond
              <br />
              <em aria-label="the horizon.">
                th
                <span className="hero-outline-e" aria-hidden="true" /> horizon.
              </em>
            </h1>
            <p className="hero-lede">
              Your daily connection to the universe—NASA imagery, mission data,
              and the stories behind our exploration of space.
            </p>
            <div className="hero-actions">
              <a className="button" href="#daily-briefing">
                View today’s briefing
              </a>
              <Link className="button button--secondary" to="/apod">
                Browse the archive
              </Link>
            </div>
          </div>
          <div className="orbit-graphic" aria-hidden="true">
            <span className="planet" />
            <span className="orbit orbit-one" />
            <span className="orbit orbit-two" />
            <span className="orbit orbit-one orbit-one--foreground" />
            <i />
          </div>
        </div>
        <div className="telemetry">
          <span>
            <small>Station time</small>
            <UtcClock />
          </span>
          <span>
            <small>Data link</small>
            <strong className="nominal">NASA // ACTIVE</strong>
          </span>
          <span>
            <small>Current module</small>
            <strong>APOD // 01</strong>
          </span>
        </div>
      </section>
      <section className="section briefing" id="daily-briefing">
        <div className="section-heading">
          <div>
            <p className="kicker">
              <span />
              Daily transmission
            </p>
            <h2>Today’s cosmic briefing</h2>
          </div>
          <Link className="text-link" to="/apod">
            Explore the archive →
          </Link>
        </div>
        {query.isPending ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState
            message={error?.message ?? "An unexpected error occurred."}
            requestId={error?.requestId}
            retry={() => void query.refetch()}
          />
        ) : (
          <>
            <DataStatus
              source="NASA APOD"
              updatedAt={query.dataUpdatedAt}
              refreshing={query.isFetching}
            />
            <ApodPanel
              apod={query.data}
              saved={favorites.isFavorite(query.data.date)}
              onToggle={() => favorites.toggle(query.data)}
            />
          </>
        )}
      </section>
      <section className="section upcoming">
        <div className="section-heading">
          <div>
            <p className="kicker">
              <span />
              Expansion roadmap
            </p>
            <h2>More instruments coming online</h2>
          </div>
        </div>
        <div className="module-grid">
          <Link className="module-card module-card--active" to="/asteroids">
            <span>02</span>
            <small>Instrument online</small>
            <h3>Asteroid Watch</h3>
            {asteroidQuery.data ? (
              <p>
                {asteroidQuery.data.totalCount} approaches in the next seven
                days; {asteroidQuery.data.potentiallyHazardousCount} carry
                NASA’s potentially hazardous classification.
              </p>
            ) : (
              <p>
                Near-Earth object encounters translated into clear, responsible
                science.
              </p>
            )}
          </Link>
          <Link className="module-card module-card--active" to="/media">
            <span>03</span>
            <small>Instrument online</small>
            <h3>Media Library</h3>
            <p>
              Search the NASA Image and Video Library across decades of
              exploration.
            </p>
          </Link>
          <Link className="module-card module-card--active" to="/space-weather">
            <span>04</span>
            <small>Instrument online</small>
            <h3>Space Weather</h3>
            <p>
              Solar flares, coronal mass ejections, and geomagnetic conditions.
            </p>
          </Link>
          <Link className="module-card module-card--active" to="/earth">
            <span>05</span>
            <small>Instrument online</small>
            <h3>Earth Observatory</h3>
            <p>Sunlit EPIC sequences and daily MODIS Terra global imagery.</p>
          </Link>
          <Link className="module-card module-card--active" to="/missions">
            <span>06</span>
            <small>Archive online</small>
            <h3>Mission Archive</h3>
            <p>Source-checked flight histories from Apollo to Webb.</p>
          </Link>
          <Link className="module-card module-card--active" to="/trivia">
            <span>07</span>
            <small>Simulation online</small>
            <h3>Space Trivia</h3>
            <p>
              Source-checked mission knowledge with explanations after every
              answer.
            </p>
          </Link>
          <Link className="module-card module-card--active" to="/discover">
            <span>08</span>
            <small>Guidance online</small>
            <h3>Discovery Paths</h3>
            <p>
              Follow evidence across live observations, mission history, and
              NASA’s media archive.
            </p>
          </Link>
        </div>
      </section>
    </>
  );
}

export function UtcClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);
  return <strong>{now.toISOString().slice(11, 19)} UTC</strong>;
}
