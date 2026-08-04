import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../api/apod";
import { ErrorState, LoadingState } from "../components/AsyncState";
import { useMediaDetail } from "../features/media/useMedia";
import { useMediaFavorites } from "../hooks/useMediaFavorites";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";

export function MediaDetailPage() {
  const nasaId = useParams().nasaId ?? "";
  const query = useMediaDetail(nasaId);
  const error = query.error instanceof ApiError ? query.error : undefined;
  const favorites = useMediaFavorites();
  const recent = useRecentlyViewed();
  useEffect(() => {
    if (!query.data) return;
    recent.record({
      kind: "media",
      id: query.data.nasaId,
      title: query.data.title,
      path: `/media/${encodeURIComponent(query.data.nasaId)}`,
    });
  }, [query.data, recent.record]);
  if (query.isPending)
    return (
      <section className="section">
        <LoadingState />
      </section>
    );
  if (query.isError)
    return (
      <section className="section">
        <ErrorState
          message={error?.message ?? "An unexpected error occurred."}
          requestId={error?.requestId}
          retry={() => void query.refetch()}
        />
      </section>
    );

  const item = query.data;
  return (
    <article className="section media-detail">
      <Link className="text-link" to="/media">
        ← Return to media search
      </Link>
      <div className="media-detail__grid">
        <div className="media-detail__visual">
          {item.mediaType === "image" &&
          (item.playbackUrl || item.previewUrl) ? (
            <img
              src={item.playbackUrl ?? item.previewUrl ?? ""}
              alt={item.title}
            />
          ) : item.mediaType === "video" && item.playbackUrl ? (
            <video
              controls
              preload="metadata"
              poster={item.previewUrl ?? undefined}
            >
              <source src={item.playbackUrl} />
              Your browser cannot play this NASA video.
            </video>
          ) : item.mediaType === "audio" && item.playbackUrl ? (
            <div className="media-detail__audio">
              {item.previewUrl && <img src={item.previewUrl} alt="" />}
              <audio controls preload="metadata">
                <source src={item.playbackUrl} />
              </audio>
            </div>
          ) : (
            <div className="media-card__fallback">Preview unavailable</div>
          )}
        </div>
        <div className="media-detail__copy">
          <p className="kicker">
            <span />
            {item.mediaType} // {item.nasaId}
          </p>
          <h1>{item.title}</h1>
          <dl>
            <div>
              <dt>Published</dt>
              <dd>
                {new Date(item.dateCreated).toLocaleDateString(undefined, {
                  dateStyle: "long",
                  timeZone: "UTC",
                })}
              </dd>
            </div>
            <div>
              <dt>NASA center</dt>
              <dd>{item.center ?? "Not supplied"}</dd>
            </div>
            <div>
              <dt>Creator</dt>
              <dd>{item.photographer ?? "Not supplied"}</dd>
            </div>
          </dl>
          <p>
            {item.description ||
              "NASA did not supply a description for this asset."}
          </p>
          {item.keywords.length > 0 && (
            <ul className="keyword-list" aria-label="Keywords">
              {item.keywords.map((keyword) => (
                <li key={keyword}>{keyword}</li>
              ))}
            </ul>
          )}
          <div className="media-detail__actions">
            <button
              className="button"
              type="button"
              aria-pressed={favorites.isFavorite(item.nasaId)}
              onClick={() => favorites.toggle(item)}
            >
              {favorites.isFavorite(item.nasaId)
                ? "Remove from Flight Log"
                : "Save to Flight Log"}
            </button>
            {item.downloadUrl && (
              <a
                className="button button--secondary"
                href={item.downloadUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open original asset
              </a>
            )}
            <a
              className="button button--secondary"
              href={`https://images.nasa.gov/details/${encodeURIComponent(item.nasaId)}`}
              target="_blank"
              rel="noreferrer"
            >
              View at NASA
            </a>
          </div>
          <p className="usage-note">
            NASA should be acknowledged as the source. Check the asset metadata
            for third-party copyright or identifiable-person restrictions before
            reuse.
          </p>
        </div>
      </div>
    </article>
  );
}
