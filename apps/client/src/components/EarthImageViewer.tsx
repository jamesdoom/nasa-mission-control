import type { EarthImage } from "@mission-control/shared";

type Props = {
  images: EarthImage[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export function EarthImageViewer({ images, selectedIndex, onSelect }: Props) {
  const selected = images[selectedIndex] ?? images[0];
  if (!selected) return null;
  const time = new Date(selected.capturedAtUtc).toLocaleTimeString("en-US", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return (
    <div className="earth-viewer">
      <div className="earth-viewer__stage">
        <img
          src={selected.imageUrl}
          alt={`Full sunlit Earth captured by EPIC at ${time} UTC`}
        />
        <div className="earth-viewer__telemetry">
          <span>EPIC // {time} UTC</span>
          <span>
            Center {selected.centroid.latitude.toFixed(1)}°,{" "}
            {selected.centroid.longitude.toFixed(1)}°
          </span>
        </div>
      </div>
      <div className="earth-viewer__copy">
        <p className="eyebrow">DSCOVR // SUN-EARTH L1</p>
        <h2>Our world in daylight</h2>
        <p>{selected.caption}</p>
        <p className="earth-viewer__note">
          EPIC views the continuously sunlit face of Earth from roughly 1.5
          million kilometers away. Natural-color imagery combines three adjusted
          spectral bands.
        </p>
        <a
          className="text-link"
          href={selected.downloadUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open full-resolution PNG ↗
        </a>
      </div>
      <div className="earth-filmstrip" aria-label="EPIC image sequence">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            aria-label={`Show Earth image ${String(index + 1)} of ${String(images.length)}`}
            aria-current={index === selectedIndex ? "true" : undefined}
            onClick={() => onSelect(index)}
          >
            <img src={image.thumbnailUrl} alt="" loading="lazy" />
            <span>
              {new Date(image.capturedAtUtc).toISOString().slice(11, 16)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
