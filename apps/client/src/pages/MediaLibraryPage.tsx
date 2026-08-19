import { useEffect, useState, type SyntheticEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { ApiError } from "../api/apod";
import { ErrorState, LoadingState } from "../components/AsyncState";
import { DataStatus } from "../components/DataStatus";
import { MediaCard } from "../components/MediaCard";
import { useMediaSearch } from "../features/media/useMedia";

const mediaTypes = ["all", "image", "video", "audio"] as const;
type MediaFilter = (typeof mediaTypes)[number];

function validMediaType(value: string | null): MediaFilter {
  return mediaTypes.includes(value as MediaFilter)
    ? (value as MediaFilter)
    : "all";
}

export function MediaLibraryPage() {
  const [params, setParams] = useSearchParams();
  const requestedQuery = params.get("q")?.trim();
  const query =
    requestedQuery === undefined || requestedQuery === ""
      ? "apollo"
      : requestedQuery;
  const mediaType = validMediaType(params.get("mediaType"));
  const parsedPage = Number(params.get("page"));
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const [draft, setDraft] = useState(query);
  const result = useMediaSearch(query, mediaType, page);
  const error = result.error instanceof ApiError ? result.error : undefined;

  useEffect(() => setDraft(query), [query]);

  function update(next: {
    q?: string;
    mediaType?: MediaFilter;
    page?: number;
  }) {
    const nextQuery = next.q ?? query;
    const nextType = next.mediaType ?? mediaType;
    const nextPage = next.page ?? 1;
    setParams({ q: nextQuery, mediaType: nextType, page: String(nextPage) });
  }

  function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = draft.trim();
    if (nextQuery.length >= 2) update({ q: nextQuery, page: 1 });
  }

  return (
    <>
      <section className="section media-intro">
        <p className="kicker">
          <span />
          Archive downlink // Instrument 03
        </p>
        <h1>NASA Media Library</h1>
        <p>
          Search decades of NASA photography, video, and audio. Every result is
          delivered from NASA’s public archive with its original mission
          metadata.
        </p>
        <form className="media-console" onSubmit={submit}>
          <label htmlFor="media-query">Search the archive</label>
          <div className="media-search-row">
            <input
              id="media-query"
              type="search"
              value={draft}
              minLength={2}
              maxLength={100}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Apollo 11, Webb, Mars…"
            />
            <button className="button" type="submit">
              Run search
            </button>
          </div>
          <fieldset>
            <legend>Media type</legend>
            {mediaTypes.map((type) => (
              <label key={type}>
                <input
                  type="radio"
                  name="media-type"
                  value={type}
                  checked={mediaType === type}
                  onChange={() => update({ mediaType: type, page: 1 })}
                />
                <span>{type === "all" ? "All media" : type}</span>
              </label>
            ))}
          </fieldset>
        </form>
      </section>
      <section className="section media-results" aria-live="polite">
        <div className="section-heading">
          <div>
            <p className="kicker">
              <span />
              Search telemetry
            </p>
            <h2>Results for “{query}”</h2>
          </div>
          {result.data && (
            <p>{result.data.totalHits.toLocaleString()} archive records</p>
          )}
        </div>
        {result.isPending ? (
          <LoadingState />
        ) : result.isError ? (
          <ErrorState
            message={error?.message ?? "An unexpected error occurred."}
            requestId={error?.requestId}
            retry={() => void result.refetch()}
          />
        ) : result.data.items.length === 0 ? (
          <div className="state-panel">
            <strong>No signals found</strong>
            <p>Try a broader mission, spacecraft, or destination.</p>
          </div>
        ) : (
          <>
            <DataStatus
              source="NASA Image and Video Library"
              updatedAt={result.dataUpdatedAt}
              refreshing={result.isFetching}
            />
            <div className="media-grid">
              {result.data.items.map((item) => (
                <MediaCard key={item.nasaId} item={item} />
              ))}
            </div>
            <nav className="pagination" aria-label="Search results pages">
              <button
                className="button button--secondary"
                type="button"
                disabled={page <= 1}
                onClick={() => update({ page: page - 1 })}
              >
                Previous
              </button>
              <span>
                Page {page} of {result.data.totalPages.toLocaleString()}
              </span>
              <button
                className="button button--secondary"
                type="button"
                disabled={page >= result.data.totalPages}
                onClick={() => update({ page: page + 1 })}
              >
                Next
              </button>
            </nav>
          </>
        )}
      </section>
    </>
  );
}
