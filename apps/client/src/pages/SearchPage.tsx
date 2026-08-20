import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { MediaItem } from "@mission-control/shared";
import { ApiError } from "../api/apod";
import { ErrorState, LoadingState } from "../components/AsyncState";
import { DataStatus } from "../components/DataStatus";
import { MediaCard } from "../components/MediaCard";
import { ProvenancePanel } from "../components/ProvenancePanel";
import {
  matchesDiscoveryQuery,
  searchDiscoveryIndex,
  type DiscoveryResult,
  type DiscoveryResultKind,
} from "../data/discoveryIndex";
import { useMediaSearch } from "../features/media/useMedia";
import { useAsteroidFavorites } from "../hooks/useAsteroidFavorites";
import { useFavorites } from "../hooks/useFavorites";
import { useJourneyFavorites } from "../hooks/useJourneyFavorites";
import { useMediaFavorites } from "../hooks/useMediaFavorites";
import { useMissionFavorites } from "../hooks/useMissionFavorites";

const sources = [
  "all",
  "instrument",
  "mission",
  "path",
  "saved",
  "media",
] as const;
type SearchSource = (typeof sources)[number];
const sourceLabels: Record<SearchSource, string> = {
  all: "All sources",
  instrument: "Instruments",
  mission: "Missions",
  path: "Guided paths",
  saved: "Flight Log",
  media: "NASA media",
};
const kindLabels: Record<DiscoveryResultKind, string> = {
  instrument: "Instrument",
  mission: "Mission",
  path: "Guided path",
  saved: "Flight Log",
};

function sourceFrom(value: string | null): SearchSource {
  return sources.includes(value as SearchSource)
    ? (value as SearchSource)
    : "all";
}

function savedResult(
  id: string,
  title: string,
  description: string,
  to: string,
  keywords: readonly (string | null | undefined)[],
): DiscoveryResult {
  return {
    id: `saved-${id}`,
    title,
    description,
    to,
    kind: "saved",
    keywords: keywords.filter(Boolean).join(" ").toLocaleLowerCase(),
  };
}

function SearchResultCard({ result }: { result: DiscoveryResult }) {
  return (
    <article className="discovery-result-card">
      <span>{kindLabels[result.kind]}</span>
      <h4>{result.title}</h4>
      <p>{result.description}</p>
      <Link to={result.to}>Open record →</Link>
    </article>
  );
}

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q")?.trim() ?? "";
  const source = sourceFrom(params.get("source"));
  const [draft, setDraft] = useState(query);
  const apod = useFavorites();
  const asteroids = useAsteroidFavorites();
  const missions = useMissionFavorites();
  const paths = useJourneyFavorites();
  const media = useMediaFavorites();
  const searchNASA =
    query.length >= 2 && (source === "all" || source === "media");
  const nasaMedia = useMediaSearch(searchNASA ? query : "", "all", 1);
  const mediaError =
    nasaMedia.error instanceof ApiError ? nasaMedia.error : undefined;

  useEffect(() => setDraft(query), [query]);

  const localResults = useMemo(
    () =>
      source === "saved" || source === "media"
        ? []
        : searchDiscoveryIndex(
            query,
            source === "all" ? undefined : (source as DiscoveryResultKind),
          ),
    [query, source],
  );
  const savedResults = useMemo(() => {
    const records = [
      ...paths.favorites.map((item) =>
        savedResult(item.id, item.title, item.summary, `/discover#${item.id}`, [
          item.code,
          item.outcome,
        ]),
      ),
      ...asteroids.favorites.map((item) =>
        savedResult(
          item.id,
          item.name,
          `Saved near-Earth object · approach ${item.approach.date}`,
          `/asteroids/${item.id}?${new URLSearchParams({ startDate: item.approach.date, endDate: item.approach.date }).toString()}`,
          [item.id],
        ),
      ),
      ...missions.favorites.map((item) =>
        savedResult(
          item.slug,
          item.name,
          `Saved mission · ${item.destination}`,
          `/missions/${item.slug}`,
          [item.program, item.dek],
        ),
      ),
      ...media.favorites.map((item) =>
        savedResult(
          item.nasaId,
          item.title,
          `Saved NASA ${item.mediaType}`,
          `/media/${item.nasaId}`,
          [item.description, item.center, ...item.keywords],
        ),
      ),
      ...apod.favorites.map((item) =>
        savedResult(
          item.date,
          item.title,
          `Saved APOD · ${item.date}`,
          `/apod?date=${item.date}`,
          [item.explanation, item.copyright],
        ),
      ),
    ];
    return source === "all" || source === "saved"
      ? records.filter((record) =>
          matchesDiscoveryQuery(query, [
            record.title,
            record.description,
            record.keywords,
          ]),
        )
      : [];
  }, [
    apod.favorites,
    asteroids.favorites,
    media.favorites,
    missions.favorites,
    paths.favorites,
    query,
    source,
  ]);
  const mediaItems: MediaItem[] = searchNASA
    ? (nasaMedia.data?.items.slice(0, 8) ?? [])
    : [];
  const visibleCount =
    localResults.length + savedResults.length + mediaItems.length;

  function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = new URLSearchParams();
    if (draft.trim()) next.set("q", draft.trim());
    if (source !== "all") next.set("source", source);
    setParams(next);
  }

  function updateSource(nextSource: SearchSource) {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (nextSource !== "all") next.set("source", nextSource);
    setParams(next);
  }

  return (
    <>
      <section className="section search-intro">
        <p className="kicker">
          <span />
          Unified discovery // Instrument 10
        </p>
        <div>
          <h1>Search the mission index</h1>
          <p>
            Cross instruments, reviewed mission history, guided investigations,
            your browser-local Flight Log, and NASA’s public media archive from
            one console.
          </p>
        </div>
        <aside>
          <strong>{visibleCount}</strong>
          <span>results currently in view</span>
        </aside>
      </section>
      <section className="section search-console-section">
        <form className="search-console" onSubmit={submit} role="search">
          <label htmlFor="unified-search">
            Search Mission Control and NASA media
          </label>
          <div>
            <input
              id="unified-search"
              type="search"
              value={draft}
              minLength={2}
              maxLength={100}
              placeholder="Moon, Artemis, Jupiter, solar activity…"
              onChange={(event) => setDraft(event.target.value)}
            />
            <button className="button" type="submit">
              Search index
            </button>
          </div>
          <small>
            NASA media search activates for queries of at least two characters.
          </small>
        </form>
        <fieldset className="search-source-filter">
          <legend>Result source</legend>
          {sources.map((item) => (
            <label key={item}>
              <input
                type="radio"
                name="search-source"
                checked={source === item}
                onChange={() => updateSource(item)}
              />
              <span>{sourceLabels[item]}</span>
            </label>
          ))}
        </fieldset>
      </section>
      <section className="section provenance-section">
        <ProvenancePanel
          kind="live"
          title="Three evidence channels, one index"
          summary="Local index · Browser storage · NASA Media API"
          details={[
            "Instrument, mission, and guided-path results come from the versioned application bundle.",
            "Flight Log matches are read only from validated records stored in this browser and are never uploaded.",
            "NASA media results are retrieved live through the normalized Mission Control server endpoint; archive metadata can describe historical assets.",
          ]}
        />
      </section>
      <section
        className="section search-results"
        aria-live="polite"
        aria-labelledby="search-results-title"
      >
        <div className="section-heading">
          <div>
            <p className="kicker">
              <span />
              Indexed returns
            </p>
            <h2 id="search-results-title">
              {query
                ? `Results for “${query}”`
                : "Explore the full local index"}
            </h2>
          </div>
          <p>{visibleCount} matches</p>
        </div>
        {localResults.length > 0 ? (
          <section aria-labelledby="local-results-title">
            <h3 id="local-results-title">Mission Control</h3>
            <div className="discovery-results-grid">
              {localResults.map((result) => (
                <SearchResultCard key={result.id} result={result} />
              ))}
            </div>
          </section>
        ) : null}
        {savedResults.length > 0 ? (
          <section aria-labelledby="saved-results-title">
            <h3 id="saved-results-title">Your Flight Log</h3>
            <div className="discovery-results-grid">
              {savedResults.map((result) => (
                <SearchResultCard key={result.id} result={result} />
              ))}
            </div>
          </section>
        ) : null}
        {searchNASA ? (
          <section aria-labelledby="nasa-results-title">
            <div className="search-results__source-heading">
              <h3 id="nasa-results-title">NASA Media Library</h3>
              {nasaMedia.data ? (
                <Link
                  to={`/media?${new URLSearchParams({ q: query, mediaType: "all", page: "1" }).toString()}`}
                >
                  View all {nasaMedia.data.totalHits.toLocaleString()} NASA
                  records →
                </Link>
              ) : null}
            </div>
            {nasaMedia.isPending ? (
              <LoadingState />
            ) : nasaMedia.isError ? (
              <ErrorState
                message={
                  mediaError?.message ??
                  "NASA media search is temporarily unavailable. Local results remain available."
                }
                requestId={mediaError?.requestId}
                retry={() => void nasaMedia.refetch()}
              />
            ) : (
              <>
                <DataStatus
                  source="NASA Image and Video Library"
                  updatedAt={nasaMedia.dataUpdatedAt}
                  refreshing={nasaMedia.isFetching}
                />
                <div className="media-grid">
                  {mediaItems.map((item) => (
                    <MediaCard key={item.nasaId} item={item} />
                  ))}
                </div>
              </>
            )}
          </section>
        ) : null}
        {visibleCount === 0 && !nasaMedia.isPending ? (
          <div className="empty-state">
            <span aria-hidden="true">⌁</span>
            <h3>No indexed records match</h3>
            <p>Try a broader term or return to all sources.</p>
            <button
              className="button"
              type="button"
              onClick={() => setParams(query ? { q: query } : {})}
            >
              Search all sources
            </button>
          </div>
        ) : null}
      </section>
    </>
  );
}
