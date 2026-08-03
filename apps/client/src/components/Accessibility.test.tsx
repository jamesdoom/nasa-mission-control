import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";
import type { Apod } from "@mission-control/shared";
import { ApodPanel } from "./ApodPanel";
import { AppShell } from "./AppShell";
import { AsteroidCard } from "./AsteroidCard";
import { MediaCard } from "./MediaCard";
import { SpaceWeatherCard } from "./SpaceWeatherCard";

const apod: Apod = {
  date: "2024-01-01",
  title: "A cosmic view",
  explanation: "An educational description of a distant galaxy.",
  mediaType: "image",
  mediaUrl: "https://example.com/image.jpg",
  hdUrl: null,
  thumbnailUrl: null,
  copyright: null,
};
const weatherEvent = {
  id: "2026-08-02T15:00:00-GST-001",
  category: "storm" as const,
  title: "Geomagnetic storm observation",
  startTimeUtc: "2026-08-02T15:00:00.000Z",
  endTimeUtc: null,
  location: "Earth",
  activeRegion: null,
  instruments: ["NOAA"],
  summary: "Minor observed geomagnetic activity",
  measurements: [
    {
      label: "Peak Kp",
      value: "5.67",
      explanation: "Minor observed geomagnetic activity.",
    },
  ],
  linkedEventIds: [],
  sourceUrl: "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/GST/1/-1",
};
const jsdomAxeOptions = {
  rules: { "color-contrast": { enabled: false } },
};

describe("automated accessibility", () => {
  it("finds no detectable violations in the application shell", async () => {
    const router = createMemoryRouter([
      {
        path: "/",
        element: <AppShell />,
        children: [{ index: true, element: <h1>Test mission</h1> }],
      },
    ]);
    const { container } = render(<RouterProvider router={router} />);
    const results = await axe(container, jsdomAxeOptions);
    expect(results.violations).toEqual([]);
  });

  it("finds no detectable violations in APOD content", async () => {
    const { container } = render(
      <main>
        <ApodPanel apod={apod} saved={false} onToggle={() => undefined} />
      </main>,
    );
    const results = await axe(container, jsdomAxeOptions);
    expect(results.violations).toEqual([]);
  });

  it("finds no detectable violations in an asteroid encounter card", async () => {
    const asteroid = {
      id: "123",
      name: "(2026 TEST)",
      jplUrl: "https://ssd.jpl.nasa.gov/example",
      potentiallyHazardous: true,
      sentryObject: false,
      diameterMeters: { min: 100, max: 200 },
      approach: {
        date: "2026-07-29",
        dateTimeUtc: "2026-07-29T12:00:00.000Z",
        velocityKph: 50_000,
        missDistanceKm: 2_000_000,
        missDistanceLunar: 5.2,
      },
    };
    const router = createMemoryRouter([
      {
        path: "/",
        element: (
          <main>
            <AsteroidCard
              asteroid={asteroid}
              saved={false}
              onToggle={() => undefined}
              detailQuery="startDate=2026-07-29&endDate=2026-07-29"
            />
          </main>
        ),
      },
    ]);
    const { container } = render(<RouterProvider router={router} />);
    const results = await axe(container, jsdomAxeOptions);
    expect(results.violations).toEqual([]);
  });

  it("finds no detectable violations in a media archive card", async () => {
    const router = createMemoryRouter([
      {
        path: "/",
        element: (
          <main>
            <MediaCard
              item={{
                nasaId: "AS11-40-5903",
                title: "Buzz Aldrin on the Moon",
                description: "Apollo 11 lunar surface activity.",
                mediaType: "image",
                dateCreated: "1969-07-20T00:00:00Z",
                center: "JSC",
                photographer: "Neil Armstrong",
                keywords: ["Moon"],
                previewUrl: "https://example.com/preview.jpg",
              }}
            />
          </main>
        ),
      },
    ]);
    const { container } = render(<RouterProvider router={router} />);
    const results = await axe(container, jsdomAxeOptions);
    expect(results.violations).toEqual([]);
  });

  it("finds no detectable violations in a space weather card", async () => {
    const { container } = render(
      <main>
        <SpaceWeatherCard event={weatherEvent} />
      </main>,
    );
    const results = await axe(container, jsdomAxeOptions);
    expect(results.violations).toEqual([]);
  });
});
