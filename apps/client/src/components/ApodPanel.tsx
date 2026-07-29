import type { Apod } from "@mission-control/shared";
import { HeartIcon } from "./Icons";
import { ApodMedia } from "./ApodMedia";

export function ApodPanel({
  apod,
  saved,
  onToggle,
  compact = false,
}: {
  apod: Apod;
  saved: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  return (
    <article
      className={compact ? "apod-panel apod-panel--compact" : "apod-panel"}
    >
      <div className="apod-visual">
        <ApodMedia apod={apod} eager={!compact} />
        <span className="media-badge">{apod.mediaType}</span>
      </div>
      <div className="apod-copy">
        <div className="eyebrow">
          <span>Observation // {apod.date}</span>
          <button
            className={saved ? "icon-button is-saved" : "icon-button"}
            type="button"
            aria-pressed={saved}
            aria-label={
              saved
                ? `Remove ${apod.title} from favorites`
                : `Save ${apod.title} to favorites`
            }
            onClick={onToggle}
          >
            <HeartIcon />
          </button>
        </div>
        <h2>{apod.title}</h2>
        {apod.copyright && <p className="credit">Credit: {apod.copyright}</p>}
        <p className="explanation">{apod.explanation}</p>
        {apod.hdUrl && (
          <a
            className="text-link"
            href={apod.hdUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open high-resolution image <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </article>
  );
}
