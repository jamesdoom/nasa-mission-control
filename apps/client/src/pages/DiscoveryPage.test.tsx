import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { axe } from "vitest-axe";
import { beforeEach, describe, expect, it } from "vitest";
import { DiscoveryPage } from "./DiscoveryPage";

describe("DiscoveryPage", () => {
  beforeEach(() => localStorage.clear());

  it("presents accessible guided paths across existing instruments", async () => {
    const { container } = render(
      <MemoryRouter>
        <DiscoveryPage />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", {
        name: "Follow the evidence across Mission Control",
      }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll(".journey-card")).toHaveLength(9);
    expect(
      screen.getByText("27 connected investigation steps"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Verify context with NASA Apollo 11 ↗",
      }),
    ).toHaveAttribute("href", "https://www.nasa.gov/mission/apollo-11/");
    expect(
      screen.getByRole("link", {
        name: "Verify context with NASA Artemis I ↗",
      }),
    ).toHaveAttribute("href", "https://www.nasa.gov/mission/artemis-i/");
    const results = await axe(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it("saves a guided path to the Flight Log", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <DiscoveryPage />
      </MemoryRouter>,
    );
    const save = screen.getByRole("button", {
      name: "Save Follow a signal from the Sun to Earth to Flight Log",
    });
    await user.click(save);
    expect(save).toHaveAttribute("aria-pressed", "true");
    expect(
      localStorage.getItem("mission-control:journey-favorites:v1"),
    ).toContain("sun-to-earth");
  });
});
