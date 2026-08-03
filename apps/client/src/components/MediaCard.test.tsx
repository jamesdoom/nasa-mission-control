import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { MediaCard } from "./MediaCard";

describe("MediaCard", () => {
  it("presents normalized archive metadata and a detail route", () => {
    const router = createMemoryRouter([
      {
        path: "/",
        element: (
          <MediaCard
            item={{
              nasaId: "AS11-40-5903",
              title: "Buzz Aldrin on the Moon",
              description: "Apollo 11 lunar surface activity.",
              mediaType: "image",
              dateCreated: "1969-07-20T00:00:00Z",
              center: "JSC",
              photographer: "Neil Armstrong",
              keywords: ["Moon"],
              previewUrl: "https://example.com/preview.jpg",
            }}
          />
        ),
      },
    ]);
    render(<RouterProvider router={router} />);
    expect(
      screen.getByRole("heading", { name: "Buzz Aldrin on the Moon" }),
    ).toBeVisible();
    expect(screen.getByText("JSC // 1969")).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Open Buzz Aldrin on the Moon" }),
    ).toHaveAttribute("href", "/media/AS11-40-5903");
  });
});
