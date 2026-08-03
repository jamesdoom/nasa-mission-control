import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpaceWeatherCard } from "./SpaceWeatherCard";

export const stormEvent = {
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
      explanation: "Minor observed geomagnetic activity; observed in UTC.",
    },
  ],
  linkedEventIds: ["2026-07-30T16:53:00-CME-001"],
  sourceUrl: "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/GST/1/-1",
};

describe("SpaceWeatherCard", () => {
  it("presents observed measurements with source context", () => {
    render(<SpaceWeatherCard event={stormEvent} />);
    expect(
      screen.getByRole("heading", { name: stormEvent.title }),
    ).toBeVisible();
    expect(screen.getByText("5.67")).toBeVisible();
    expect(
      screen.getByText("Minor observed geomagnetic activity", {
        selector: ".weather-card__summary",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Open DONKI record/ }),
    ).toHaveAttribute("href", stormEvent.sourceUrl);
  });
});
