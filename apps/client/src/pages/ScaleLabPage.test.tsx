import { fireEvent, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ScaleLabPage } from "./ScaleLabPage";

describe("ScaleLabPage", () => {
  it("compares selected profiles and preserves measurement state", async () => {
    const router = createMemoryRouter(
      [{ path: "/scale-lab", element: <ScaleLabPage /> }],
      { initialEntries: ["/scale-lab?profiles=moon%2Cmars&metric=signal"] },
    );
    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { name: "How long would a signal need?" }),
    ).toBeVisible();
    expect(screen.getAllByText("1.3 seconds")).toHaveLength(2);
    expect(screen.getAllByText("12.7 minutes")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "Object diameter" }));
    expect(router.state.location.search).toContain("metric=diameter");
    expect(
      await screen.findByRole("heading", {
        name: "How wide is the destination or spacecraft?",
      }),
    ).toBeVisible();
  });
});
