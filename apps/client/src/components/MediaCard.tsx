import type { MediaItem } from "@mission-control/shared";
import { Link } from "react-router-dom";

export function MediaCard({ item }: { item: MediaItem }) {
  const year = Number.isNaN(Date.parse(item.dateCreated))
    ? null
    : new Date(item.dateCreated).getUTCFullYear();
  return (
    <article className="media-card">
      <Link
        className="media-card__visual"
        to={`/media/${encodeURIComponent(item.nasaId)}`}
        aria-label={`Open ${item.title}`}
      >
        {item.previewUrl ? (
          <img src={item.previewUrl} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className="media-card__fallback" aria-hidden="true">
            No preview
          </span>
        )}
        <span className={`media-type media-type--${item.mediaType}`}>
          {item.mediaType}
        </span>
      </Link>
      <div className="media-card__body">
        <p className="media-card__meta">
          {item.center ?? "NASA archive"}
          {year ? ` // ${String(year)}` : ""}
        </p>
        <h2>{item.title}</h2>
        <p>{item.description || "Description unavailable for this asset."}</p>
        <Link
          className="text-link"
          to={`/media/${encodeURIComponent(item.nasaId)}`}
        >
          Inspect asset →
        </Link>
      </div>
    </article>
  );
}
