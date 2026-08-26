import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { StoryCollectionPage } from "./StoryCollectionPage";

describe("StoryCollectionPage", () => {
  it("presents a bounded evidence sequence, chronology, and NASA sources", () => {
    const router = createMemoryRouter(
      [{ path: "/stories/:storyId", element: <StoryCollectionPage /> }],
      { initialEntries: ["/stories/mars-habitability"] },
    );
    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", {
        name: "Reading the record of a wetter Mars",
      }),
    ).toBeVisible();
    expect(screen.getAllByRole("link", { name: /Open chapter/ })).toHaveLength(
      4,
    );
    expect(
      screen.getByText("Habitability is not evidence that life existed.", {
        exact: false,
      }),
    ).toBeVisible();
    expect(screen.getAllByRole("link", { name: /NASA/ })).toHaveLength(3);
    expect(
      screen.getByRole("navigation", { name: "Story evidence path" }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Continue in guided learning" }),
    ).toHaveAttribute("href", "/learn?track=mars-evidence");
  });

  it("offers recovery for an unknown story", () => {
    const router = createMemoryRouter(
      [{ path: "/stories/:storyId", element: <StoryCollectionPage /> }],
      { initialEntries: ["/stories/not-real"] },
    );
    render(<RouterProvider router={router} />);
    expect(
      screen.getByRole("heading", { name: "Science story not found" }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Browse science stories" }),
    ).toHaveAttribute("href", "/discover");
  });
});
