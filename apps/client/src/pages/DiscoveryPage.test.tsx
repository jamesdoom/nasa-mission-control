import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";
import { DiscoveryPage } from "./DiscoveryPage";

describe("DiscoveryPage", () => {
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
    expect(screen.getAllByRole("article")).toHaveLength(5);
    expect(
      screen.getByRole("link", {
        name: "Verify context with NASA Apollo 11 ↗",
      }),
    ).toHaveAttribute("href", "https://www.nasa.gov/mission/apollo-11/");
    const results = await axe(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
