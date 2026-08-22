import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { missions } from "../data/missions";
import { MissionCard } from "./MissionCard";

describe("MissionCard", () => {
  afterEach(() => vi.unstubAllGlobals());

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

  it("defers its image source until the card approaches the viewport", () => {
    let notifyIntersection: IntersectionObserverCallback | undefined;
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: IntersectionObserverCallback) {
          notifyIntersection = callback;
        }
        observe = vi.fn();
        disconnect = vi.fn();
      },
    );
    const mission = missions[0];
    if (!mission) throw new Error("Expected a curated mission fixture.");
    render(
      <MemoryRouter>
        <MissionCard mission={mission} />
      </MemoryRouter>,
    );
    const image = screen.getByRole("img", { name: mission.image.alt });
    expect(image).not.toHaveAttribute("src");

    act(() => {
      notifyIntersection?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(image).toHaveAttribute(
      "src",
      `/assets/missions/cards/${mission.slug}.jpg`,
    );
  });
});
