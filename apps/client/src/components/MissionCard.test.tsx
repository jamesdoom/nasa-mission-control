import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { missions } from "../data/missions";
import { MissionCard } from "./MissionCard";

describe("MissionCard", () => {
  it("presents a curated mission with status, destination, and detail link", () => {
    const mission = missions[0];
    if (!mission) throw new Error("Expected a curated mission fixture.");
    render(
      <MemoryRouter>
        <MissionCard mission={mission} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: mission.name })).toBeVisible();
    expect(screen.getByText(mission.statusLabel)).toBeVisible();
    expect(
      screen.getByRole("img", { name: mission.image.alt }),
    ).toHaveAttribute("src", `/assets/missions/cards/${mission.slug}.jpg`);
    expect(
      screen.getByRole("link", {
        name: `Open ${mission.name} mission archive`,
      }),
    ).toHaveAttribute("href", `/missions/${mission.slug}`);
  });
});
