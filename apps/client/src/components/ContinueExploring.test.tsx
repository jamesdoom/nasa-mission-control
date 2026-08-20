import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ContinueExploring } from "./ContinueExploring";

describe("ContinueExploring", () => {
  it("presents contextual routes as labeled navigation", () => {
    render(
      <MemoryRouter>
        <ContinueExploring
          links={[
            {
              code: "MISSION",
              title: "Open Juno",
              description: "Investigate Jupiter.",
              to: "/missions/juno",
            },
          ]}
        />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("complementary", { name: "Continue exploring" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: /Open Juno/ })).toHaveAttribute(
      "href",
      "/missions/juno",
    );
  });
});
