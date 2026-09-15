import { useEffect, useState } from "react";
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
  const [explanationExpanded, setExplanationExpanded] = useState(false);
  const explanationId = `apod-explanation-${apod.date}`;

  useEffect(() => setExplanationExpanded(false), [apod.date]);

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
          <span>Archive date // {apod.date}</span>
          <button
            className={saved ? "apod-save is-saved" : "apod-save"}
            type="button"
            aria-pressed={saved}
            aria-label={
              saved
                ? `Remove ${apod.title} from Flight Log`
                : `Save ${apod.title} to Flight Log`
            }
            onClick={onToggle}
          >
            <HeartIcon />
            <span>{saved ? "Saved (Remove)" : "Save to Flight Log"}</span>
          </button>
        </div>
        <h2>{apod.title}</h2>
        {apod.copyright && <p className="credit">Credit: {apod.copyright}</p>}
        <p
          className={
            explanationExpanded
              ? "explanation explanation--expanded"
              : "explanation"
          }
          id={explanationId}
        >
          {apod.explanation}
        </p>
        <button
          className="text-link explanation-toggle"
          type="button"
          aria-controls={explanationId}
          aria-expanded={explanationExpanded}
          onClick={() => setExplanationExpanded((expanded) => !expanded)}
        >
          {explanationExpanded ? "Show less" : "Continue reading"}
        </button>
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
