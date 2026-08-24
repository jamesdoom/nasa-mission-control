import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  AsteroidTrendAnalysis,
  DonkiComparison,
  EarthTimelineAnalysis,
} from "./ScientificAnalysis";

describe("ScientificAnalysis", () => {
  it("pairs asteroid trends with the exact accessible source table", () => {
    render(
      <AsteroidTrendAnalysis
        asteroids={[
          {
            id: "1",
            name: "Test",
            jplUrl: "https://example.com",
            potentiallyHazardous: false,
            sentryObject: false,
            diameterMeters: { min: 1, max: 2 },
            approach: {
              date: "2026-08-01",
              dateTimeUtc: "2026-08-01T00:00:00Z",
              velocityKph: 100,
              missDistanceKm: 1234,
              missDistanceLunar: 2,
            },
          },
        ]}
      />,
    );
    expect(
      screen.getByRole("img", { name: /Daily encounter counts/ }),
    ).toBeVisible();
    expect(
      screen.getByRole("table", {
        name: "Calculated daily totals from normalized NASA/JPL approaches",
      }),
    ).toHaveTextContent("1,234 km");
  });
  it("exposes DONKI and EPIC visual data as tables", () => {
    const base = {
      category: "flare" as const,
      startTimeUtc: "2026-08-01T00:00:00Z",
      endTimeUtc: null,
      location: "S10W20",
      activeRegion: 1,
      instruments: ["GOES"],
      summary: "Observed",
      measurements: [
        { label: "Class", value: "M1.0", explanation: "X-ray class" },
      ],
      linkedEventIds: [],
      sourceUrl: "https://example.com",
    };
    render(
      <>
        <DonkiComparison
          events={[
            { ...base, id: "a", title: "A" },
            { ...base, id: "b", title: "B" },
          ]}
        />
        <EarthTimelineAnalysis
          images={[
            {
              id: "earth",
              caption: "Earth",
              capturedAtUtc: "2026-08-01T00:00:00Z",
              centroid: { latitude: 1, longitude: 2 },
              imageUrl: "https://example.com/a",
              thumbnailUrl: "https://example.com/b",
              downloadUrl: "https://example.com/c",
            },
          ]}
        />
      </>,
    );
    expect(
      screen.getByRole("table", { name: /Observed and modeled fields/ }),
    ).toBeVisible();
    expect(
      screen.getByRole("table", { name: /EPIC timestamps/ }),
    ).toBeVisible();
  });
});
