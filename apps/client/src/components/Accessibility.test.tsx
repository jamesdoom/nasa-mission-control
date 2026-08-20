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
import { MissionCard } from "./MissionCard";
import { missions } from "../data/missions";
import { TriviaPage } from "../pages/TriviaPage";
import { FavoritesPage } from "../pages/FavoritesPage";
import { MissionComparePage } from "../pages/MissionComparePage";
import { ScaleLabPage } from "../pages/ScaleLabPage";
import { EarthImageViewer } from "./EarthImageViewer";
import { ProvenancePanel } from "./ProvenancePanel";

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

  it("finds no detectable violations in the EPIC image viewer", async () => {
    const { container } = render(
      <main>
        <EarthImageViewer
          images={[
            {
              id: "epic-1",
              caption: "Earth from DSCOVR",
              capturedAtUtc: "2026-08-01T00:45:54.000Z",
              centroid: { latitude: 5, longitude: -156 },
              imageUrl: "https://example.com/earth.jpg",
              thumbnailUrl: "https://example.com/earth-thumb.jpg",
              downloadUrl: "https://example.com/earth.png",
            },
          ]}
          selectedIndex={0}
          onSelect={() => undefined}
        />
      </main>,
    );
    const results = await axe(container, jsdomAxeOptions);
    expect(results.violations).toEqual([]);
  });

  it("finds no detectable violations in a curated mission card", async () => {
    const mission = missions[0];
    if (!mission) throw new Error("Expected a curated mission fixture.");
    const router = createMemoryRouter([
      {
        path: "/",
        element: (
          <main>
            <MissionCard mission={mission} />
          </main>
        ),
      },
    ]);
    const { container } = render(<RouterProvider router={router} />);
    const results = await axe(container, jsdomAxeOptions);
    expect(results.violations).toEqual([]);
  });

  it("finds no detectable violations in the trivia simulation", async () => {
    const router = createMemoryRouter([{ path: "/", element: <TriviaPage /> }]);
    const { container } = render(<RouterProvider router={router} />);
    const results = await axe(container, jsdomAxeOptions);
    expect(results.violations).toEqual([]);
  });

  it("finds no detectable violations in the populated Flight Log controls", async () => {
    localStorage.setItem(
      "mission-control:mission-favorites:v1",
      JSON.stringify(["apollo-11"]),
    );
    const router = createMemoryRouter([
      { path: "/", element: <FavoritesPage /> },
    ]);
    const { container } = render(<RouterProvider router={router} />);
    const results = await axe(container, jsdomAxeOptions);
    expect(results.violations).toEqual([]);
    localStorage.removeItem("mission-control:mission-favorites:v1");
  });

  it("finds no detectable violations in mission comparison", async () => {
    const router = createMemoryRouter(
      [{ path: "/missions/compare", element: <MissionComparePage /> }],
      {
        initialEntries: ["/missions/compare?missions=apollo-11,artemis-i"],
      },
    );
    const { container } = render(<RouterProvider router={router} />);
    const results = await axe(container, jsdomAxeOptions);
    expect(results.violations).toEqual([]);
  });

  it("finds no detectable violations in the celestial scale laboratory", async () => {
    const router = createMemoryRouter(
      [{ path: "/scale-lab", element: <ScaleLabPage /> }],
      { initialEntries: ["/scale-lab?profiles=moon,mars,saturn"] },
    );
    const { container } = render(<RouterProvider router={router} />);
    const results = await axe(container, jsdomAxeOptions);
    expect(results.violations).toEqual([]);
  });

  it("finds no detectable violations in evidence provenance guidance", async () => {
    const { container } = render(
      <main>
        <ProvenancePanel
          kind="curated"
          title="Reviewed mission record"
          summary="Source review 2026-08-01"
          details={["This record links to official NASA sources."]}
        />
      </main>,
    );
    const results = await axe(container, jsdomAxeOptions);
    expect(results.violations).toEqual([]);
  });
});
