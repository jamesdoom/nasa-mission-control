import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { APOD_EARLIEST_DATE } from "@mission-control/shared";
import { ApiError } from "../api/apod";
import { ApodPanel } from "../components/ApodPanel";
import { ErrorState, LoadingState } from "../components/AsyncState";
import { useApod } from "../features/apod/useApod";
import { useFavorites } from "../hooks/useFavorites";

const today = () => new Date().toISOString().slice(0, 10);

export function ApodPage() {
  const [params, setParams] = useSearchParams();
  const selectedDate = params.get("date") ?? today();
  const [draftDate, setDraftDate] = useState(selectedDate);
  useEffect(() => setDraftDate(selectedDate), [selectedDate]);
  const query = useApod(selectedDate);
  const favorites = useFavorites();
  const error = query.error instanceof ApiError ? query.error : undefined;
  return (
    <section className="section page-section">
      <div className="page-intro">
        <p className="kicker">
          <span />
          Instrument 01
        </p>
        <h1>
          Astronomy Picture
          <br />
          of the Day
        </h1>
        <p>
          One remarkable view of our universe, selected daily by NASA
          astronomers. Choose any date from the archive to begin.
        </p>
      </div>
      <form
        className="date-console"
        onSubmit={(event) => {
          event.preventDefault();
          setParams(draftDate === today() ? {} : { date: draftDate });
        }}
      >
        <label htmlFor="apod-date">Observation date</label>
        <div>
          <input
            id="apod-date"
            type="date"
            min={APOD_EARLIEST_DATE}
            max={today()}
            value={draftDate}
            onChange={(event) => setDraftDate(event.target.value)}
            required
          />
          <button className="button" type="submit">
            Acquire
          </button>
        </div>
        <small>Archive begins {APOD_EARLIEST_DATE}. Dates use UTC.</small>
      </form>
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState
          message={error?.message ?? "An unexpected error occurred."}
          requestId={error?.requestId}
          retry={() => void query.refetch()}
        />
      ) : (
        <ApodPanel
          apod={query.data}
          saved={favorites.isFavorite(query.data.date)}
          onToggle={() => favorites.toggle(query.data)}
        />
      )}
    </section>
  );
}
