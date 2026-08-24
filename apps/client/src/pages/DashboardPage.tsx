import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../api/apod";
import { ApodPanel } from "../components/ApodPanel";
import { ErrorState, LoadingState } from "../components/AsyncState";
import { DataStatus } from "../components/DataStatus";
import { EvidenceGuide } from "../components/EvidenceGuide";
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
              <em>the horizon.</em>
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
      <section className="section journey-start" aria-labelledby="start-title">
        <div className="section-heading">
          <div>
            <p className="kicker">
              <span />
              Choose your route
            </p>
            <h2 id="start-title">Start with one clear path</h2>
          </div>
          <p>Every route is available without an account.</p>
        </div>
        <div className="journey-start__grid">
          <Link className="journey-start__card" to="/asteroids">
            <small>About 3 minutes · Live data</small>
            <h3>See what is passing Earth</h3>
            {asteroidQuery.data ? (
              <p>
                {asteroidQuery.data.totalCount} approaches in the next seven
                days, explained with responsible risk context.
              </p>
            ) : (
              <p>
                Explore near-Earth encounters with responsible risk context.
              </p>
            )}
            <span>Open Asteroid Watch →</span>
          </Link>
          <Link className="journey-start__card" to="/missions">
            <small>About 5 minutes · Curated history</small>
            <h3>Follow a landmark mission</h3>
            <p>Browse source-checked flight histories from Apollo to Webb.</p>
            <span>Open Mission Archive →</span>
          </Link>
          <Link className="journey-start__card" to="/discover">
            <small>10–15 minutes · Guided learning</small>
            <h3>Investigate a space question</h3>
            <p>
              Connect observations, mission history, and NASA media in order.
            </p>
            <span>Choose a Discovery Path →</span>
          </Link>
        </div>
      </section>
      <div className="section evidence-guide-wrap">
        <EvidenceGuide />
      </div>
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
