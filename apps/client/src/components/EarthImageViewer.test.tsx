import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { EarthImage } from "@mission-control/shared";
import { EarthImageViewer } from "./EarthImageViewer";

const images: EarthImage[] = [0, 1].map((index) => ({
  id: `epic-${String(index)}`,
  caption: "EPIC image aboard DSCOVR",
  capturedAtUtc: `2026-08-01T0${String(index)}:45:54.000Z`,
  centroid: { latitude: 5.2, longitude: -156.4 },
  imageUrl: `https://example.com/${String(index)}.jpg`,
  thumbnailUrl: `https://example.com/${String(index)}-thumb.jpg`,
  downloadUrl: `https://example.com/${String(index)}.png`,
}));

describe("EarthImageViewer", () => {
  it("presents EPIC context and exposes keyboard-operable sequence controls", () => {
    const onSelect = vi.fn();
    render(
      <EarthImageViewer
        images={images}
        selectedIndex={0}
        onSelect={onSelect}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Our world in daylight" }),
    ).toBeVisible();
    expect(
      screen.getByRole("img", { name: /Full sunlit Earth/ }),
    ).toHaveAttribute("src", images[0]?.imageUrl);
    fireEvent.click(
      screen.getByRole("button", { name: "Show Earth image 2 of 2" }),
    );
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});
