import { useState, type ChangeEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ApodPanel } from "../components/ApodPanel";
import { AsteroidCard } from "../components/AsteroidCard";
import { FlightLogControls } from "../components/FlightLogControls";
import { MediaCard } from "../components/MediaCard";
import { MissionCard } from "../components/MissionCard";
import { RecordPersonalization } from "../components/RecordPersonalization";
import { useAsteroidFavorites } from "../hooks/useAsteroidFavorites";
import { useFavorites } from "../hooks/useFavorites";
import { useJourneyFavorites } from "../hooks/useJourneyFavorites";
import { useMediaFavorites } from "../hooks/useMediaFavorites";
import { useMissionFavorites } from "../hooks/useMissionFavorites";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import {
  annotationKey,
  useFlightLogPersonalization,
} from "../hooks/useFlightLogPersonalization";
import {
  createFlightLogBackup,
  previewFlightLogBackup,
  restoreFlightLogBackup,
  type FlightLogBackupPreview,
} from "../utils/flightLogBackup";
import {
  flightLogCollectionFrom,
  flightLogSortFrom,
  matchesFlightLogSearch,
  sortFlightLogItems,
  type FlightLogCollection,
  type FlightLogSort,
} from "../utils/flightLogFilters";

export function FavoritesPage() {
  const [params, setParams] = useSearchParams();
  const favorites = useFavorites();
  const asteroidFavorites = useAsteroidFavorites();
  const missionFavorites = useMissionFavorites();
  const mediaFavorites = useMediaFavorites();
  const journeyFavorites = useJourneyFavorites();
  const recent = useRecentlyViewed();
  const personalization = useFlightLogPersonalization();
  const [backupStatus, setBackupStatus] = useState("");
  const [pendingBackup, setPendingBackup] = useState<
    { text: string; preview: FlightLogBackupPreview } | undefined
  >();
  const [viewName, setViewName] = useState("");
  const query = params.get("q") ?? "";
  const collection = flightLogCollectionFrom(params.get("collection"));
  const sort = flightLogSortFrom(params.get("sort"));
  const isEmpty =
    favorites.favorites.length === 0 &&
    asteroidFavorites.favorites.length === 0 &&
    missionFavorites.favorites.length === 0 &&
    mediaFavorites.favorites.length === 0 &&
    journeyFavorites.favorites.length === 0;
  const savedCount =
    favorites.favorites.length +
    asteroidFavorites.favorites.length +
    missionFavorites.favorites.length +
    mediaFavorites.favorites.length +
    journeyFavorites.favorites.length;
  const activeCollectionCount = [
    favorites.favorites,
    asteroidFavorites.favorites,
    missionFavorites.favorites,
    mediaFavorites.favorites,
    journeyFavorites.favorites,
  ].filter((items) => items.length > 0).length;
  const sections = [
    {
      id: "journeys",
      label: "Guided paths",
      count: journeyFavorites.favorites.length,
    },
    {
      id: "asteroids",
      label: "Asteroids",
      count: asteroidFavorites.favorites.length,
    },
    {
      id: "missions",
      label: "Missions",
      count: missionFavorites.favorites.length,
    },
    {
      id: "media",
      label: "NASA media",
      count: mediaFavorites.favorites.length,
    },
    { id: "apod", label: "APOD", count: favorites.favorites.length },
  ];
  function personalValues(key: string): string[] {
    const annotation = personalization.annotations[key];
    return annotation
      ? [annotation.note, annotation.collection, ...annotation.tags]
      : [];
  }
  const filteredJourneys = sortFlightLogItems(
    journeyFavorites.favorites.filter((journey) =>
      matchesFlightLogSearch(query, [
        journey.title,
        journey.summary,
        journey.code,
        ...personalValues(annotationKey("journey", journey.id)),
      ]),
    ),
    sort,
    (journey) => journey.title,
  );
  const filteredAsteroids = sortFlightLogItems(
    asteroidFavorites.favorites.filter((asteroid) =>
      matchesFlightLogSearch(query, [
        asteroid.name,
        asteroid.id,
        ...personalValues(annotationKey("asteroid", asteroid.id)),
      ]),
    ),
    sort,
    (asteroid) => asteroid.name,
  );
  const filteredMissions = sortFlightLogItems(
    missionFavorites.favorites.filter((mission) =>
      matchesFlightLogSearch(query, [
        mission.name,
        mission.program,
        mission.destination,
        mission.dek,
        ...personalValues(annotationKey("mission", mission.slug)),
      ]),
    ),
    sort,
    (mission) => mission.name,
  );
  const filteredMedia = sortFlightLogItems(
    mediaFavorites.favorites.filter((item) =>
      matchesFlightLogSearch(query, [
        item.title,
        item.description,
        item.center,
        ...item.keywords,
        ...personalValues(annotationKey("media", item.nasaId)),
      ]),
    ),
    sort,
    (item) => item.title,
  );
  const filteredApod = sortFlightLogItems(
    favorites.favorites.filter((apod) =>
      matchesFlightLogSearch(query, [
        apod.title,
        apod.explanation,
        apod.date,
        apod.copyright,
        ...personalValues(annotationKey("apod", apod.date)),
      ]),
    ),
    sort,
    (apod) => apod.title,
  );
  const collectionCounts: Record<
    Exclude<FlightLogCollection, "all">,
    number
  > = {
    journeys: filteredJourneys.length,
    asteroids: filteredAsteroids.length,
    missions: filteredMissions.length,
    media: filteredMedia.length,
    apod: filteredApod.length,
  };
  const visibleSavedCount =
    collection === "all"
      ? Object.values(collectionCounts).reduce(
          (total, count) => total + count,
          0,
        )
      : collectionCounts[collection];
  const allCollectionCounts: Record<FlightLogCollection, number> = {
    all: savedCount,
    journeys: journeyFavorites.favorites.length,
    asteroids: asteroidFavorites.favorites.length,
    missions: missionFavorites.favorites.length,
    media: mediaFavorites.favorites.length,
    apod: favorites.favorites.length,
  };

  function updateControls(
    updates: Partial<{
      q: string;
      collection: FlightLogCollection;
      sort: FlightLogSort;
    }>,
  ) {
    const next = new URLSearchParams(params);
    const nextQuery = updates.q ?? query;
    const nextCollection = updates.collection ?? collection;
    const nextSort = updates.sort ?? sort;
    if (nextQuery) next.set("q", nextQuery);
    else next.delete("q");
    if (nextCollection !== "all") next.set("collection", nextCollection);
    else next.delete("collection");
    if (nextSort !== "default") next.set("sort", nextSort);
    else next.delete("sort");
    setParams(next, { replace: updates.q !== undefined });
  }

  function downloadBackup(): void {
    const blob = new Blob([createFlightLogBackup(localStorage)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `mission-control-flight-log-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setBackupStatus("Flight Log backup downloaded.");
  }

  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      setPendingBackup({
        text,
        preview: previewFlightLogBackup(text, localStorage),
      });
      setBackupStatus("Backup checked. Choose merge or replace to continue.");
    } catch (error) {
      setBackupStatus(
        error instanceof Error
          ? error.message
          : "The backup could not be restored.",
      );
    }
  }

  function applyBackup(strategy: "merge" | "replace") {
    if (!pendingBackup) return;
    const restored = restoreFlightLogBackup(
      pendingBackup.text,
      localStorage,
      strategy,
    );
    setBackupStatus(
      `${strategy === "merge" ? "Merged" : "Replaced"} ${String(restored)} supported browser records. Reloading…`,
    );
    setPendingBackup(undefined);
    window.setTimeout(() => window.location.reload(), 400);
  }
  return (
    <section className="section page-section">
      <div className="page-intro">
        <p className="kicker">
          <span />
          Personal flight log
        </p>
        <h1>Saved discoveries</h1>
        <p>Your favorite observations are stored only in this browser.</p>
      </div>
      <section
        className="flight-log-console"
        aria-labelledby="flight-log-summary"
      >
        <div>
          <p className="eyebrow">Local archive status</p>
          <h2 id="flight-log-summary">
            {savedCount} saved {savedCount === 1 ? "record" : "records"}
          </h2>
          <p>
            Jump to a collection or create a portable backup. Imports replace
            matching browser-local records only; no data is uploaded.
          </p>
          <dl className="flight-log-metrics">
            <div>
              <dt>Active collections</dt>
              <dd>{activeCollectionCount}/5</dd>
            </div>
            <div>
              <dt>Recent activity</dt>
              <dd>{recent.items.length}</dd>
            </div>
          </dl>
        </div>
        <nav aria-label="Saved Flight Log collections">
          {sections.map((section) =>
            section.count > 0 ? (
              <a href={`#${section.id}`} key={section.id}>
                <span>{section.label}</span>
                <strong>{String(section.count).padStart(2, "0")}</strong>
              </a>
            ) : null,
          )}
        </nav>
        <div className="flight-log-backup">
          <button
            className="button button--secondary"
            type="button"
            onClick={downloadBackup}
          >
            Export backup
          </button>
          <label
            className="button button--secondary"
            htmlFor="flight-log-import"
          >
            Import backup
          </label>
          <input
            className="sr-only"
            id="flight-log-import"
            type="file"
            accept="application/json,.json"
            onChange={(event) => void importBackup(event)}
          />
          <p role="status" aria-live="polite">
            {backupStatus}
          </p>
          {pendingBackup ? (
            <div className="flight-log-backup__preview">
              <strong>Backup ready for review</strong>
              <p>
                Exported{" "}
                {new Date(
                  pendingBackup.preview.exportedAt,
                ).toLocaleDateString()}{" "}
                · {pendingBackup.preview.supportedRecords} supported records ·{" "}
                {pendingBackup.preview.existingRecords} overlap with this
                browser.
              </p>
              <button type="button" onClick={() => applyBackup("merge")}>
                Merge, keep local conflicts
              </button>
              <button type="button" onClick={() => applyBackup("replace")}>
                Replace supported records
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingBackup(undefined);
                  setBackupStatus("Import cancelled. No data changed.");
                }}
              >
                Cancel
              </button>
            </div>
          ) : null}
        </div>
      </section>
      {!isEmpty && (
        <FlightLogControls
          query={query}
          collection={collection}
          sort={sort}
          savedCount={savedCount}
          visibleCount={visibleSavedCount}
          counts={allCollectionCounts}
          onQueryChange={(value) => updateControls({ q: value })}
          onCollectionChange={(value) => updateControls({ collection: value })}
          onSortChange={(value) => updateControls({ sort: value })}
          onClear={() => setParams({}, { replace: true })}
        />
      )}
      {!isEmpty ? (
        <section
          className="flight-log-saved-views"
          aria-labelledby="saved-views-title"
        >
          <div>
            <p className="eyebrow">Reusable filters</p>
            <h2 id="saved-views-title">Saved Flight Log views</h2>
            <p>
              Store the current search, collection, and sort controls on this
              device.
            </p>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              personalization.saveView(viewName, params.toString());
              setViewName("");
            }}
          >
            <label>
              View name
              <input
                value={viewName}
                maxLength={40}
                placeholder="e.g. Mars missions"
                onChange={(event) => setViewName(event.target.value)}
              />
            </label>
            <button
              className="button button--secondary"
              type="submit"
              disabled={!viewName.trim()}
            >
              Save current view
            </button>
          </form>
          {personalization.savedViews.length > 0 ? (
            <ul>
              {personalization.savedViews.map((view) => (
                <li key={view.id}>
                  <Link
                    to={view.query ? `/favorites?${view.query}` : "/favorites"}
                  >
                    {view.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => personalization.removeView(view.id)}
                    aria-label={`Delete saved view ${view.name}`}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="flight-log-saved-views__empty">No saved views yet.</p>
          )}
        </section>
      ) : null}
      {isEmpty ? (
        <div className="empty-state">
          <span aria-hidden="true">✦</span>
          <h2>No discoveries logged yet</h2>
          <p>
            Save an observation, tracked object, mission, or NASA media asset
            with its heart or save control. Your first record will appear here
            and remain only on this device.
          </p>
          <div className="empty-state__actions">
            <Link className="button" to="/apod">
              Save today’s image
            </Link>
            <Link className="button button--secondary" to="/missions">
              Browse missions
            </Link>
          </div>
        </div>
      ) : null}
      {!isEmpty && visibleSavedCount === 0 && (
        <div className="empty-state flight-log-no-results">
          <span aria-hidden="true">⌁</span>
          <h2>No saved records match</h2>
          <p>Adjust the search or collection filter to reopen the archive.</p>
          <button
            className="button"
            type="button"
            onClick={() => setParams({}, { replace: true })}
          >
            Clear archive controls
          </button>
        </div>
      )}
      {(collection === "all" || collection === "journeys") &&
        filteredJourneys.length > 0 && (
          <section className="flight-log-section" id="journeys">
            <div className="section-heading">
              <div>
                <p className="kicker">
                  <span />
                  Saved investigations
                </p>
                <h2>Guided discovery paths</h2>
              </div>
            </div>
            <div className="saved-journey-grid">
              {filteredJourneys.map((journey) => (
                <article key={journey.id}>
                  <p className="eyebrow">{journey.code}</p>
                  <h3>{journey.title}</h3>
                  <p>{journey.summary}</p>
                  <div>
                    <Link to={`/discover#${journey.id}`}>Resume path →</Link>
                    <button
                      type="button"
                      onClick={() => journeyFavorites.toggle(journey)}
                    >
                      Remove
                    </button>
                  </div>
                  <RecordPersonalization
                    title={journey.title}
                    annotation={
                      personalization.annotations[
                        annotationKey("journey", journey.id)
                      ]
                    }
                    onSave={(values) =>
                      personalization.saveAnnotation(
                        annotationKey("journey", journey.id),
                        values,
                      )
                    }
                  />
                </article>
              ))}
            </div>
          </section>
        )}
      {(collection === "all" || collection === "asteroids") &&
        filteredAsteroids.length > 0 && (
          <section className="flight-log-section" id="asteroids">
            <div className="section-heading">
              <div>
                <p className="kicker">
                  <span />
                  Tracked objects
                </p>
                <h2>Asteroid encounters</h2>
              </div>
            </div>
            <div className="asteroid-list">
              {filteredAsteroids.map((asteroid) => (
                <div
                  className="flight-log-personalized-record"
                  key={asteroid.id}
                >
                  <AsteroidCard
                    asteroid={asteroid}
                    saved
                    onToggle={() => asteroidFavorites.toggle(asteroid)}
                    detailQuery={new URLSearchParams({
                      startDate: asteroid.approach.date,
                      endDate: asteroid.approach.date,
                    }).toString()}
                  />
                  <RecordPersonalization
                    title={asteroid.name}
                    annotation={
                      personalization.annotations[
                        annotationKey("asteroid", asteroid.id)
                      ]
                    }
                    onSave={(values) =>
                      personalization.saveAnnotation(
                        annotationKey("asteroid", asteroid.id),
                        values,
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      {(collection === "all" || collection === "missions") &&
        filteredMissions.length > 0 && (
          <section className="flight-log-section" id="missions">
            <div className="section-heading">
              <div>
                <p className="kicker">
                  <span />
                  Pinned flight history
                </p>
                <h2>Mission records</h2>
              </div>
            </div>
            <div className="mission-grid">
              {filteredMissions.map((mission) => (
                <div className="flight-log-saved-card" key={mission.slug}>
                  <MissionCard mission={mission} />
                  <button
                    type="button"
                    onClick={() => missionFavorites.toggle(mission)}
                    aria-label={`Remove ${mission.name} from Flight Log`}
                  >
                    Remove
                  </button>
                  <RecordPersonalization
                    title={mission.name}
                    annotation={
                      personalization.annotations[
                        annotationKey("mission", mission.slug)
                      ]
                    }
                    onSave={(values) =>
                      personalization.saveAnnotation(
                        annotationKey("mission", mission.slug),
                        values,
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      {(collection === "all" || collection === "media") &&
        filteredMedia.length > 0 && (
          <section className="flight-log-section" id="media">
            <div className="section-heading">
              <div>
                <p className="kicker">
                  <span />
                  Saved NASA assets
                </p>
                <h2>Media discoveries</h2>
              </div>
            </div>
            <div className="media-grid">
              {filteredMedia.map((item) => (
                <div className="flight-log-saved-card" key={item.nasaId}>
                  <MediaCard item={item} />
                  <button
                    type="button"
                    onClick={() => mediaFavorites.toggle(item)}
                    aria-label={`Remove ${item.title} from Flight Log`}
                  >
                    Remove
                  </button>
                  <RecordPersonalization
                    title={item.title}
                    annotation={
                      personalization.annotations[
                        annotationKey("media", item.nasaId)
                      ]
                    }
                    onSave={(values) =>
                      personalization.saveAnnotation(
                        annotationKey("media", item.nasaId),
                        values,
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      {(collection === "all" || collection === "apod") &&
        filteredApod.length > 0 && (
          <section className="flight-log-section" id="apod">
            <div className="section-heading">
              <div>
                <p className="kicker">
                  <span />
                  Saved observations
                </p>
                <h2>APOD discoveries</h2>
              </div>
            </div>
            <div className="favorites-grid">
              {filteredApod.map((apod) => (
                <div className="flight-log-personalized-record" key={apod.date}>
                  <ApodPanel
                    apod={apod}
                    saved
                    onToggle={() => favorites.toggle(apod)}
                    compact
                  />
                  <RecordPersonalization
                    title={apod.title}
                    annotation={
                      personalization.annotations[
                        annotationKey("apod", apod.date)
                      ]
                    }
                    onSave={(values) =>
                      personalization.saveAnnotation(
                        annotationKey("apod", apod.date),
                        values,
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      {recent.items.length > 0 && (
        <section className="flight-log-section recent-history">
          <div className="section-heading">
            <div>
              <p className="kicker">
                <span />
                Navigation history
              </p>
              <h2>Recently viewed</h2>
            </div>
            <button
              className="button button--secondary"
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    "Clear recently viewed history from this browser?",
                  )
                )
                  recent.clear();
              }}
            >
              Clear history
            </button>
          </div>
          <ol>
            {recent.items.map((item) => (
              <li key={`${item.kind}-${item.id}`}>
                <span>{item.kind}</span>
                <Link to={item.path}>{item.title}</Link>
                <time dateTime={item.viewedAt}>
                  {new Date(item.viewedAt).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ol>
        </section>
      )}
      {!isEmpty ? (
        <section
          className="flight-log-section continuation-suggestions"
          aria-labelledby="continue-title"
        >
          <div className="section-heading">
            <div>
              <p className="kicker">
                <span />
                On-device suggestions
              </p>
              <h2 id="continue-title">Continue your exploration</h2>
            </div>
            <p>
              Based only on saved collections and recent activity in this
              browser.
            </p>
          </div>
          <div>
            {missionFavorites.favorites.length >= 2 ? (
              <Link
                to={`/missions/compare?missions=${missionFavorites.favorites
                  .slice(0, 3)
                  .map((mission) => mission.slug)
                  .join(",")}`}
              >
                Compare saved missions →
              </Link>
            ) : (
              <Link to="/missions">Add another mission →</Link>
            )}
            {journeyFavorites.favorites[0] ? (
              <Link to={`/discover#${journeyFavorites.favorites[0].id}`}>
                Resume {journeyFavorites.favorites[0].title} →
              </Link>
            ) : (
              <Link to="/discover#science-stories">
                Begin a science story →
              </Link>
            )}
            <Link to="/search">Search across Mission Control →</Link>
          </div>
        </section>
      ) : null}
    </section>
  );
}
