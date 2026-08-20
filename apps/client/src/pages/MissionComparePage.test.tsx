import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { MissionComparePage } from "./MissionComparePage";

describe("MissionComparePage", () => {
  it("compares mission profiles and merges their timelines", () => {
    render(
      <MemoryRouter
        initialEntries={["/missions/compare?missions=apollo-11,artemis-i"]}
      >
        <MissionComparePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("2/3 aligned")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Apollo 11" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Artemis I" })).toBeVisible();
    expect(screen.getByText(/source-checked milestones/)).toBeVisible();

    fireEvent.click(screen.getByRole("checkbox", { name: /Juno/ }));
    expect(screen.getByText("3/3 aligned")).toBeVisible();
    expect(screen.getByRole("checkbox", { name: /Webb/ })).toBeDisabled();
  });
});
