import type { Apod } from "@mission-control/shared";

export function ApodMedia({
  apod,
  eager = false,
}: {
  apod: Apod;
  eager?: boolean;
}) {
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
