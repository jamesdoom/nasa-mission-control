import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../api/apod";
import { ApodPanel } from "../components/ApodPanel";
import { ErrorState, LoadingState } from "../components/AsyncState";
import { DataStatus } from "../components/DataStatus";
import { EvidenceGuide } from "../components/EvidenceGuide";
import { useApod } from "../features/apod/useApod";
import { useAsteroids } from "../features/asteroids/useAsteroids";
import { useFavorites } from "../hooks/useFavorites";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { briefingStatus, feedStatus } from "../utils/briefingStatus";
import { utcDate } from "../utils/dates";

export function DashboardPage() {
  const heroRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    let visible = true;
    const update = () => {
      hero.dataset.animationsPaused = String(!visible || document.hidden);
    };
    const observer =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver(([entry]) => {
            visible = entry?.isIntersecting ?? false;
            update();
          })
        : undefined;
    observer?.observe(hero);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", update);
      delete hero.dataset.animationsPaused;
    };
  }, []);
  const query = useApod();
  const asteroidQuery = useAsteroids(utcDate(), utcDate(6));
  const favorites = useFavorites();
  const online = useNetworkStatus();
  const status = briefingStatus([query, asteroidQuery], online);
  const asteroidStatus = feedStatus(asteroidQuery, online);
  const error = query.error instanceof ApiError ? query.error : undefined;
  return (
    <>
      <div className="dashboard-first-look">
        <section ref={heroRef} className="hero section dashboard-hero">
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
                Space, worth exploring
              </p>
              <h1>
                Explore beyond
                <br />
                <em>the horizon.</em>
              </h1>
              <p className="hero-lede">
                Discover NASA's daily picture, follow landmark missions, and
                test your knowledge of the universe.
              </p>
              <div className="hero-actions">
                <Link className="button" to="/apod">
                  Explore the daily picture
                </Link>
                <Link className="text-link" to="/missions">
                  Discover the missions
                </Link>
              </div>
            </div>
          </div>
          <div className="telemetry">
            <span>
              <small>Station time</small>
              <UtcClock />
            </span>
            <span>
              <small>Briefing data</small>
              <strong>{status}</strong>
            </span>
            <span>
              <small>Briefing sources</small>
              <strong>APOD + NeoWs</strong>
            </span>
          </div>
        </section>
        <section className="section briefing" id="daily-briefing">
          <div className="section-heading">
            <div>
              <p className="kicker">
                <span />
                Selected by NASA
              </p>
              <h2>A window into our universe</h2>
            </div>
            <Link className="text-link" to="/apod">
              Explore the archive →
            </Link>
          </div>

          {!online && !query.data ? (
            <div className="state-panel">
              <p>No daily image is loaded. Reconnect, then reload the page.</p>
            </div>
          ) : query.isPending ? (
            <LoadingState
              title="Loading the daily image"
              detail="Waiting for the APOD response; no observation is available yet."
            />
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
                refreshing={online && query.isFetching}
                data={query.data}
              />
              <ApodPanel
                apod={query.data}
                saved={favorites.isFavorite(query.data.date)}
                onToggle={() => favorites.toggle(query.data)}
              />
            </>
          )}
        </section>
      </div>
      <section className="section journey-start" aria-labelledby="start-title">
        <div className="section-heading">
          <div>
            <p className="kicker">
              <span />
              Choose your route
            </p>
            <h2 id="start-title">Start with one clear path</h2>
          </div>
        </div>
        <div className="journey-start__grid">
          <Link className="journey-start__card" to="/asteroids">
            <small>About 3 minutes · NASA NeoWs</small>
            <h3>See what is passing Earth</h3>
            <p>Asteroid Watch: {asteroidStatus}</p>
            {asteroidQuery.data ? (
              <p>
                {asteroidQuery.data.totalCount} approaches in the returned scan
                ({asteroidQuery.data.startDate}–{asteroidQuery.data.endDate},
                UTC).
                {asteroidStatus !== "Available"
                  ? " Previously retrieved values; freshness is not confirmed."
                  : " Explained with responsible risk context."}
              </p>
            ) : (
              <p>
                No encounter count is available yet. Explore Asteroid Watch for
                scan controls and responsible risk context.
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
          <Link className="journey-start__card" to="/trivia">
            <small>Space knowledge</small>
            <h3>Test your space knowledge</h3>
            <p>Explore NASA-sourced questions and explanations.</p>
            <span>Open Space Trivia →</span>
          </Link>
        </div>
      </section>
      <details className="section evidence-guide-wrap dashboard-data-guide">
        <summary>About the data labels</summary>
        <EvidenceGuide />
      </details>
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
