import { keepExplorationContext } from "../utils/explorationContext";
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
    <section className="section page-section apod-page">
      <div className="apod-page-heading">
        <div className="page-intro">
          <p className="kicker">
            <span />
            Instrument 01
          </p>
          <h1>Astronomy Picture of the Day</h1>
          <p>
            One remarkable view of our universe, selected daily by NASA
            astronomers. Choose any date from the archive to begin.
          </p>
        </div>
        <form
          className="date-console"
          onSubmit={(event) => {
            event.preventDefault();
            setParams(
              keepExplorationContext(
                params,
                draftDate === today() ? {} : { date: draftDate },
              ),
            );
          }}
        >
          <label htmlFor="apod-date">Archive date</label>
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
              View image
            </button>
          </div>
          <small>Archive begins {APOD_EARLIEST_DATE}. Dates use UTC.</small>
        </form>
      </div>
      {query.isPending ? (
        <LoadingState
          title="Loading the selected APOD record"
          detail="Finding the image or video for your selected date…"
        />
      ) : query.isError ? (
        <ErrorState
          message={
            error?.message ??
            "We could not load this date. Try again or choose another archive date."
          }
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
