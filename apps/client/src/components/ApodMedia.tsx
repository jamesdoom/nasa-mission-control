import type { Apod } from "@mission-control/shared";

function isDirectVideo(url: string): boolean {
  try {
    return /\.(?:m4v|mov|mp4|ogv|webm)$/i.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

export function ApodMedia({
  apod,
  eager = false,
}: {
  apod: Apod;
  eager?: boolean;
}) {
  if (apod.mediaType === "video" && isDirectVideo(apod.mediaUrl))
    return (
      <div className="media-frame">
        <video
          controls
          playsInline
          preload={eager ? "metadata" : "none"}
          poster={apod.thumbnailUrl ?? undefined}
          aria-label={`${apod.title} video`}
        >
          <source src={apod.mediaUrl} />
          Your browser cannot play this NASA video. You can open it using the
          link below.
        </video>
        <a
          className="media-frame__fallback"
          href={apod.mediaUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open video directly ↗
        </a>
      </div>
    );
  if (apod.mediaType === "video")
    return (
      <div className="media-frame">
        <iframe
          src={apod.mediaUrl}
          title={`${apod.title} video`}
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  return (
    <img
      className="apod-image"
      src={apod.mediaUrl}
      srcSet={
        apod.hdUrl ? `${apod.mediaUrl} 1200w, ${apod.hdUrl} 2400w` : undefined
      }
      sizes="(max-width: 800px) 100vw, 65vw"
      alt={apod.title}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
    />
  );
}
