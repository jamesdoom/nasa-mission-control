import { describe, expect, it } from "vitest";
import { updatePageMetadata } from "./pageMetadata";

describe("page metadata", () => {
  it("replaces metadata on navigation without duplicating tags or retaining private indexing rules", () => {
    updatePageMetadata("/favorites", "Personal Flight Log");
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex,follow",
    );
    updatePageMetadata("/apod", "Astronomy Picture of the Day");
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content"),
    ).toContain("archive date");
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute(
      "content",
      "Astronomy Picture of the Day | NASA Mission Control",
    );
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://nasa-mission-control-alpha.vercel.app/apod",
    );
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      "content",
      "index,follow",
    );
    updatePageMetadata("/missions", "Mission Archive");
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content"),
    ).toContain("landmark space missions");
    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(
      1,
    );
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  });
});
