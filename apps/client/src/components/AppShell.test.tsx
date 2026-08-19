import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "./AppShell";

describe("AppShell reliability behavior", () => {
  afterEach(() => vi.restoreAllMocks());

  it("announces and focuses route changes", async () => {
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
      "Saved Flight Log records remain available",
    );
    expect(screen.getByText("LOCAL MODE")).toBeInTheDocument();
  });
});
