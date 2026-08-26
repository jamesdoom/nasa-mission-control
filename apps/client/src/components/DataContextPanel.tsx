type DataContextKind = "apod" | "asteroids" | "donki" | "epic" | "media";

const context: Record<
  DataContextKind,
  {
    title: string;
    sourceUrl: string;
    cadence: string;
    meaning: string;
    limits: string;
  }
> = {
  apod: {
    title: "How to read an APOD record",
    sourceUrl: "https://api.nasa.gov/",
    cadence:
      "APOD is a dated selection, not an observation feed. Its media may have been captured much earlier.",
    meaning:
      "NASA supplies the record. Seven-day media counts are calculated here from available dates.",
    limits:
      "One selection cannot represent sky conditions or event frequency. A missing day can reflect API availability.",
  },
  asteroids: {
    title: "How to read an approach record",
    sourceUrl: "https://api.nasa.gov/",
    cadence:
      "NeoWs returns catalog predictions for seven days. Values can change as observations improve.",
    meaning:
      "Miss distance and Earth-relative speed describe one approach. Diameter is a range; LD is lunar distance and au is Earth–Sun distance.",
    limits:
      "Potentially hazardous is an orbital class, not an impact warning. No single value establishes impact probability.",
  },
  donki: {
    title: "How to read a DONKI event",
    sourceUrl: "https://ccmc.gsfc.nasa.gov/tools/DONKI/",
    cadence:
      "DONKI records can arrive or change after an event. Related records may be added later.",
    meaning:
      "Flare class and Kp are observations; CME speed is analyzed. Links and timing do not prove causation.",
    limits:
      "DONKI is preliminary research, not the official U.S. forecast or a safety alert.",
  },
  epic: {
    title: "How to read an EPIC sequence",
    sourceUrl: "https://epic.gsfc.nasa.gov/about/api",
    cadence:
      "EPIC repeatedly images sunlit Earth, but the archive is not live video and may lag today.",
    meaning:
      "NASA supplies times and center coordinates. Natural color adjusts visible bands; enhanced color emphasizes land.",
    limits:
      "Black edges or gaps can reflect processing, geometry, downlink, or availability. A frame is not a forecast.",
  },
  media: {
    title: "How to read a NASA Media record",
    sourceUrl: "https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf",
    cadence:
      "This archive is not a complete live feed. Records appear when NASA centers update metadata.",
    meaning:
      "Search matches metadata. A supplied creation or publication date may not be the moment depicted.",
    limits:
      "Counts and order do not measure importance or completeness. Files can be absent or restricted.",
  },
};

export function DataContextPanel({ kind }: { kind: DataContextKind }) {
  const item = context[kind];
  return (
    <aside
      className="hazard-note data-context"
      aria-labelledby={`${kind}-context-title`}
    >
      <span aria-hidden="true">i</span>
      <div>
        <strong id={`${kind}-context-title`}>{item.title}</strong>
        <dl>
          <div>
            <dt>Freshness</dt>
            <dd>{item.cadence}</dd>
          </div>
          <div>
            <dt>What is displayed</dt>
            <dd>{item.meaning}</dd>
          </div>
          <div>
            <dt>What it cannot show</dt>
            <dd>{item.limits}</dd>
          </div>
        </dl>
        <a href={item.sourceUrl} target="_blank" rel="noreferrer">
          Review official NASA documentation ↗
        </a>
      </div>
    </aside>
  );
}
