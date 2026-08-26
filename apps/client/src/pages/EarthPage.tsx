import { useEffect, useState, type SyntheticEvent } from "react";
import type { EarthCollection } from "@mission-control/shared";
import { useSearchParams } from "react-router-dom";
import { ApiError } from "../api/apod";
import { ErrorState, LoadingState } from "../components/AsyncState";
import { DataStatus } from "../components/DataStatus";
import { ContinueExploring } from "../components/ContinueExploring";
import { EarthImageViewer } from "../components/EarthImageViewer";
import { EarthTimelineAnalysis } from "../components/ScientificAnalysis";
import { useEarthObservation } from "../features/earth/useEarthObservation";
import { earthExplorationLinks } from "../data/contextualLinks";
import { DataContextPanel } from "../components/DataContextPanel";

function collectionFrom(value: string | null): EarthCollection {
  return value === "enhanced" ? "enhanced" : "natural";
}

export function collectionSearchParams(
  current: URLSearchParams,
  collection: EarthCollection,
  resolvedDate?: string,
): URLSearchParams {
  const next = new URLSearchParams({ collection });
  const activeDate = resolvedDate ?? current.get("date");
  const activeImage = current.get("image");
  if (activeDate) next.set("date", activeDate);
  if (activeImage) next.set("image", activeImage);
  return next;
}

export function EarthPage() {
  const [params, setParams] = useSearchParams();
  const date = params.get("date") ?? undefined;
  const collection = collectionFrom(params.get("collection"));
  const selectedIndex = Math.max(0, Number(params.get("image") ?? 1) - 1);
  const [draftDate, setDraftDate] = useState(date ?? "");
  const query = useEarthObservation(collection, date);
  const error = query.error instanceof ApiError ? query.error : undefined;

  useEffect(() => setDraftDate(date ?? ""), [date]);

  function update(nextCollection: EarthCollection) {
    setParams(
      collectionSearchParams(params, nextCollection, query.data?.date ?? date),
    );
  }

  function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = new URLSearchParams({ collection });
    if (draftDate) next.set("date", draftDate);
    setParams(next);
  }

  function selectImage(index: number) {
    const next = new URLSearchParams(params);
    next.set("collection", collection);
    next.set("date", query.data?.date ?? date ?? "");
    next.set("image", String(index + 1));
    setParams(next);
  }

  return (
    <>
      <section className="section earth-intro">
        <div>
          <p className="kicker">
            <span />
            Earth science downlink // Instrument 05
          </p>
          <h1>Earth Observatory</h1>
          <p>
            Watch the sunlit planet turn through DSCOVR EPIC imagery, then
            compare it with a daily MODIS Terra global composite.
          </p>
        </div>
        <aside>
          <span>Viewpoint</span>
          <strong>Sun-Earth L1</strong>
          <span>Sequence</span>
          <strong>{query.data?.images.length ?? "—"} frames</strong>
          <span>Latest EPIC date</span>
          <strong>{query.data?.latestAvailableDate ?? "—"}</strong>
        </aside>
      </section>
      <section className="section earth-console-section">
        <form className="earth-console" onSubmit={submit}>
          <label>
            Observation date
            <input
              type="date"
              value={draftDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(event) => setDraftDate(event.target.value)}
            />
          </label>
          <button className="button" type="submit">
            Retrieve orbit
          </button>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => {
              setDraftDate("");
              setParams({ collection });
            }}
          >
            Latest available
          </button>
        </form>
        <fieldset className="earth-collections">
          <legend>EPIC color treatment</legend>
          {(["natural", "enhanced"] as const).map((item) => (
            <label key={item}>
              <input
                type="radio"
                name="earth-collection"
                checked={collection === item}
                onChange={() => update(item)}
              />
              <span>
                {item === "natural" ? "Natural color" : "Enhanced color"}
              </span>
            </label>
          ))}
        </fieldset>
      </section>
      <section className="section">
        <DataContextPanel kind="epic" />
      </section>
      <section className="section earth-results" aria-live="polite">
        {query.isPending ? (
          <LoadingState
            title="Loading EPIC imagery"
            detail="Checking available dates and requesting NASA image metadata…"
          />
        ) : query.isError ? (
          <ErrorState
            message={error?.message ?? "An unexpected error occurred."}
            requestId={error?.requestId}
            retry={() => void query.refetch()}
          />
        ) : query.data.images.length === 0 ? (
          <div className="state-panel">
            <div>
              <strong>
                {collection === "natural" ? "Natural" : "Enhanced"} color is not
                available for {query.data.date}
              </strong>
              <p>
                NASA lists {query.data.latestAvailableDate} as the latest date
                in this collection. No frames can mean a normal archive gap or
                delayed processing; it does not describe Earth conditions.
              </p>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => {
                  setDraftDate("");
                  setParams({ collection });
                }}
              >
                Open latest {collection} color
              </button>
            </div>
          </div>
        ) : (
          <>
            <DataStatus
              source="NASA DSCOVR EPIC"
              updatedAt={query.dataUpdatedAt}
              refreshing={query.isFetching}
              data={query.data}
            />
            <EarthImageViewer
              images={query.data.images}
              selectedIndex={Math.min(
                selectedIndex,
                query.data.images.length - 1,
              )}
              onSelect={selectImage}
            />
            <EarthTimelineAnalysis images={query.data.images} />
          </>
        )}
      </section>
      {query.data && (
        <section className="section gibs-section">
          <div className="section-heading">
            <div>
              <p className="kicker">
                <span />
                Earthdata GIBS // Daily mosaic
              </p>
              <h2>A satellite-scale perspective</h2>
            </div>
            <p>{query.data.date}</p>
          </div>
          <div className="gibs-panel">
            <img
              src={query.data.dailyComposite.imageUrl}
              alt={`MODIS Terra global true-color composite for ${query.data.date}`}
              loading="lazy"
            />
            <div>
              <p className="eyebrow">MODIS // TERRA</p>
              <h3>{query.data.dailyComposite.title}</h3>
              <p>
                This global mosaic is assembled from polar-orbiting
                observations. Cloud cover is real scene content; dark or blank
                areas can indicate missing same-day coverage.
              </p>
              <a
                className="text-link"
                href={query.data.dailyComposite.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Explore NASA Earthdata GIBS ↗
              </a>
            </div>
          </div>
          <p className="source-note">
            <strong>Two instruments, two viewpoints.</strong> EPIC observes the
            sunlit disk from L1; MODIS Terra builds a global surface mosaic over
            multiple orbital passes. Neither view is a live webcam.
          </p>
        </section>
      )}
      <section className="section connected-section">
        <ContinueExploring links={earthExplorationLinks} />
      </section>
    </>
  );
}
