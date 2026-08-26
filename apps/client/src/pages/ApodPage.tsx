import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { APOD_EARLIEST_DATE } from "@mission-control/shared";
import { ApiError } from "../api/apod";
import { ApodPanel } from "../components/ApodPanel";
import { ContinueExploring } from "../components/ContinueExploring";
import { ErrorState, LoadingState } from "../components/AsyncState";
import { DataStatus } from "../components/DataStatus";
import { ApodHistoryAnalysis } from "../components/ScientificAnalysis";
import { useApod, useApodHistory } from "../features/apod/useApod";
import { useFavorites } from "../hooks/useFavorites";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import { contextualLinksForText } from "../data/contextualLinks";
import { DataContextPanel } from "../components/DataContextPanel";

const today = () => new Date().toISOString().slice(0, 10);

export function ApodPage() {
  const [params, setParams] = useSearchParams();
  const selectedDate = params.get("date") ?? today();
  const [draftDate, setDraftDate] = useState(selectedDate);
  useEffect(() => setDraftDate(selectedDate), [selectedDate]);
  const query = useApod(selectedDate);
  const history = useApodHistory(selectedDate, 7, query.isSuccess);
  const favorites = useFavorites();
  const recent = useRecentlyViewed();
  const error = query.error instanceof ApiError ? query.error : undefined;
  useEffect(() => {
    if (!query.data) return;
    recent.record({
      kind: "apod",
      id: query.data.date,
      title: query.data.title,
      path: `/apod?date=${query.data.date}`,
    });
  }, [query.data, recent.record]);
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
      <DataContextPanel kind="apod" />
      {query.isPending ? (
        <LoadingState
          title="Loading the selected APOD record"
          detail="Requesting the archive date and validating NASA’s response…"
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
            refreshing={query.isFetching}
            data={query.data}
          />
          <ApodPanel
            apod={query.data}
            saved={favorites.isFavorite(query.data.date)}
            onToggle={() => favorites.toggle(query.data)}
          />
          {!history.isPending && !history.isError ? (
            <ApodHistoryAnalysis items={history.data} />
          ) : null}
          <ContinueExploring
            links={contextualLinksForText(
              `${query.data.title} ${query.data.explanation}`,
            )}
          />
        </>
      )}
    </section>
  );
}
