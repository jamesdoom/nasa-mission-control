import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, Link, RouterProvider } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "./AppShell";

describe("AppShell reliability behavior", () => {
  afterEach(() => vi.restoreAllMocks());

  it("announces and focuses route changes", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const user = userEvent.setup();
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: <AppShell />,
          children: [
            { index: true, element: <h1>Dashboard content</h1> },
            { path: "about", element: <h1>About content</h1> },
          ],
        },
      ],
      { initialEntries: ["/"] },
    );
    render(<RouterProvider router={router} />);
    await user.click(screen.getByRole("link", { name: "About" }));
    expect(screen.getByText("About loaded")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveFocus();
  });

  it("explains which features remain available when offline", () => {
    vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(true);
    const router = createMemoryRouter([
      {
        path: "/",
        element: <AppShell />,
        children: [{ index: true, element: <h1>Dashboard content</h1> }],
      },
    ]);
    render(<RouterProvider router={router} />);
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Cached curated instruments and saved Flight Log records remain available",
    );
    expect(screen.getByText("LOCAL MODE")).toBeInTheDocument();
  });

  it("opens global command search from the keyboard", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter([
      {
        path: "/",
        element: <AppShell />,
        children: [{ index: true, element: <h1>Dashboard content</h1> }],
      },
    ]);
    render(<RouterProvider router={router} />);

    await user.keyboard("{Control>}k{/Control}");
    const dialog = await screen.findByRole("dialog", {
      name: "Command search",
    });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("returns to the top when navigating to another pathname", async () => {
    const scrollTo = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => undefined);
    const user = userEvent.setup();
    const router = createMemoryRouter(
      [
        {
          element: <AppShell />,
          children: [
            {
              path: "/discover",
              element: <Link to="/missions/artemis-i">Open instrument</Link>,
            },
            {
              path: "/missions/:slug",
              element: <h1>Artemis I</h1>,
            },
          ],
        },
      ],
      { initialEntries: ["/discover"] },
    );

    render(<RouterProvider router={router} />);
    await user.click(screen.getByRole("link", { name: "Open instrument" }));

    expect(screen.getByRole("heading", { name: "Artemis I" })).toBeVisible();
    expect(scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  });
});
