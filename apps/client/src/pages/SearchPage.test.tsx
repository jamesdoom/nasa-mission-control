import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SearchPage } from "./SearchPage";

function Location() {
  const location = useLocation();
  return <output aria-label="Current search URL">{location.search}</output>;
}

describe("SearchPage", () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("combines local, saved, and normalized NASA media results", async () => {
    localStorage.setItem(
      "mission-control:mission-favorites:v1",
      JSON.stringify(["artemis-i"]),
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            query: "Artemis",
            mediaType: "all",
            page: 1,
            pageSize: 24,
            totalHits: 1,
            totalPages: 1,
            items: [
              {
                nasaId: "ARTEMIS-TEST",
                title: "Artemis I launch",
                description: "Orion begins its lunar flight test.",
                mediaType: "image",
                dateCreated: "2022-11-16T00:00:00Z",
                center: "KSC",
                photographer: null,
                keywords: ["Artemis I"],
                previewUrl: "https://example.com/artemis.jpg",
              },
            ],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={["/search?q=Artemis"]}>
          <Routes>
            <Route
              path="/search"
              element={
                <>
                  <SearchPage />
                  <Location />
                </>
              }
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getAllByRole("heading", { name: /^Artemis I$/ }),
    ).toHaveLength(2);
    expect(
      screen.getByRole("heading", { name: "Rehearse a return to the Moon" }),
    ).toBeVisible();
    expect(await screen.findByText("Artemis I launch")).toBeVisible();
    await userEvent.click(screen.getByRole("radio", { name: "Flight Log" }));
    expect(screen.getByLabelText("Current search URL")).toHaveTextContent(
      "q=Artemis&source=saved",
    );
    expect(screen.getByText("Saved mission · Moon")).toBeVisible();
    expect(
      screen.getByText("1", { selector: ".search-intro aside strong" }),
    ).toBeVisible();
  });
});
