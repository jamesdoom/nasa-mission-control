import { useEffect, useState, type SyntheticEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { ApiError } from "../api/apod";
import { ErrorState, LoadingState } from "../components/AsyncState";
import { SpaceWeatherCard } from "../components/SpaceWeatherCard";
import { useSpaceWeather } from "../features/space-weather/useSpaceWeather";
import { utcDate } from "../utils/dates";

const categories = ["all", "flare", "cme", "storm"] as const;
type Category = (typeof categories)[number];

function categoryFrom(value: string | null): Category {
  return categories.includes(value as Category) ? (value as Category) : "all";
}

export function SpaceWeatherPage() {
  const [params, setParams] = useSearchParams();
  const startDate = params.get("startDate") ?? utcDate(-7);
  const endDate = params.get("endDate") ?? utcDate();
  const category = categoryFrom(params.get("category"));
  const [draftStart, setDraftStart] = useState(startDate);
  const [draftEnd, setDraftEnd] = useState(endDate);
  const query = useSpaceWeather(startDate, endDate, category);
  const error = query.error instanceof ApiError ? query.error : undefined;

  useEffect(() => {
    setDraftStart(startDate);
    setDraftEnd(endDate);
  }, [startDate, endDate]);

  function update(nextCategory: Category) {
    setParams({ startDate, endDate, category: nextCategory });
  }

  function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setParams({ startDate: draftStart, endDate: draftEnd, category });
  }

  return (
    <>
      <section className="section weather-intro">
        <div>
          <p className="kicker">
            <span />
            Heliophysics downlink // Instrument 04
          </p>
          <h1>Space Weather Center</h1>
        </div>
        <p>
          Explore observed solar flares, coronal mass ejections, and geomagnetic
          storms recorded by NASA’s DONKI research database.
        </p>
        <aside>
          <strong>Research data—not an operational forecast.</strong>
          <p>
            For official U.S. space weather forecasts, consult NOAA’s Space
            Weather Prediction Center.
          </p>
          <a href="https://www.swpc.noaa.gov/" target="_blank" rel="noreferrer">
            Open NOAA SWPC ↗
          </a>
        </aside>
      </section>
      <section className="section weather-console-section">
        <form className="weather-console" onSubmit={submit}>
          <label>
            Start date
            <input
              type="date"
              value={draftStart}
              max={draftEnd}
              onChange={(event) => setDraftStart(event.target.value)}
            />
          </label>
          <label>
            End date
            <input
              type="date"
              value={draftEnd}
              min={draftStart}
              onChange={(event) => setDraftEnd(event.target.value)}
            />
          </label>
          <button className="button" type="submit">
            Update observations
          </button>
          <small>DONKI searches are limited here to 30 days per request.</small>
        </form>
        <fieldset className="weather-filters">
          <legend>Event category</legend>
          {categories.map((item) => (
            <label key={item}>
              <input
                type="radio"
                name="weather-category"
                checked={category === item}
                onChange={() => update(item)}
              />
              <span>
                {item === "all"
                  ? "All events"
                  : item === "cme"
                    ? "CMEs"
                    : item === "flare"
                      ? "Solar flares"
                      : "Geomagnetic storms"}
              </span>
            </label>
          ))}
        </fieldset>
      </section>
      <section className="section weather-results" aria-live="polite">
        {query.data && (
          <div className="weather-summary">
            <div>
              <span>Solar flares</span>
              <strong>{query.data.counts.flare}</strong>
            </div>
            <div>
              <span>CMEs</span>
              <strong>{query.data.counts.cme}</strong>
            </div>
            <div>
              <span>Geomagnetic storms</span>
              <strong>{query.data.counts.storm}</strong>
            </div>
            <div>
              <span>Observation window</span>
              <strong>{query.data.events.length} events</strong>
            </div>
          </div>
        )}
        <div className="section-heading">
          <div>
            <p className="kicker">
              <span />
              Event chronology
            </p>
            <h2>Observed activity</h2>
          </div>
          <p>All timestamps shown in UTC</p>
        </div>
        {query.isPending ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState
            message={error?.message ?? "An unexpected error occurred."}
            requestId={error?.requestId}
            retry={() => void query.refetch()}
          />
        ) : query.data.events.length === 0 ? (
          <div className="state-panel">
            <div>
              <strong>No matching activity recorded</strong>
              <p>Try a wider date range or another event category.</p>
            </div>
          </div>
        ) : (
          <div className="weather-grid">
            {query.data.events.map((item) => (
              <SpaceWeatherCard key={item.id} event={item} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
