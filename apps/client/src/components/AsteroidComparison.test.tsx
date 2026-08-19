import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Asteroid } from "@mission-control/shared";
import { AsteroidComparison } from "./AsteroidComparison";

const asteroid = (id: string, name: string, distance: number): Asteroid => ({
  id,
  name,
  jplUrl: `https://ssd.jpl.nasa.gov/${id}`,
  potentiallyHazardous: false,
  sentryObject: false,
  diameterMeters: { min: 50, max: 100 },
  approach: {
    date: "2026-08-19",
    dateTimeUtc: `2026-08-19T${id.padStart(2, "0")}:00:00.000Z`,
    velocityKph: 40_000,
    missDistanceKm: distance * 384_400,
    missDistanceLunar: distance,
  },
});

describe("AsteroidComparison", () => {
  it("shows exact accessible values and changes comparison metric", async () => {
    const onMetricChange = vi.fn();
    render(
      <AsteroidComparison
        asteroids={[asteroid("1", "Closer", 2), asteroid("2", "Farther", 8)]}
        metric="distance"
        onMetricChange={onMetricChange}
      />,
    );
    expect(
      screen.getByRole("img", { name: "Closer: 2 LD" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Shorter bars are closer approaches/),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("radio", { name: "Relative velocity" }),
    );
    expect(onMetricChange).toHaveBeenCalledWith("velocity");
  });
});
