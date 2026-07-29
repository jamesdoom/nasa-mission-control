import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { Asteroid } from "@mission-control/shared";
import { AsteroidCard } from "./AsteroidCard";

const asteroid: Asteroid = {
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

describe("AsteroidCard", () => {
  it("presents NASA's classification without calling the object dangerous", async () => {
    const onToggle = vi.fn();
    render(
      <MemoryRouter>
        <AsteroidCard
          asteroid={asteroid}
          saved={false}
          onToggle={onToggle}
          detailQuery="startDate=2026-07-29&endDate=2026-07-29"
        />
      </MemoryRouter>,
    );
    expect(
      screen.getByText("Potentially hazardous classification"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/dangerous/i)).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Save (2026 TEST) to favorites" }),
    );
    expect(onToggle).toHaveBeenCalledOnce();
    expect(
      screen.getByRole("link", { name: "Open encounter →" }),
    ).toHaveAttribute(
      "href",
      "/asteroids/123?startDate=2026-07-29&endDate=2026-07-29",
    );
  });
});
