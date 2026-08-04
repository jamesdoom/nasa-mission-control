import { describe, expect, it } from "vitest";
import {
  removeVercelParsedQuery,
  removeVercelRouteParameter,
} from "../lib/vercel-url.js";

describe("Vercel API adapter", () => {
  it("removes the injected catch-all parameter and preserves app queries", () => {
    expect(
      removeVercelRouteParameter("/api/apod?date=2026-08-04&path=apod"),
    ).toBe("/api/apod?date=2026-08-04");
  });

  it("removes Vercel's parsed query so Express can parse the clean URL", () => {
    const request = { query: { date: "2026-08-04", path: ["apod"] } };
    removeVercelParsedQuery(request);
    expect(request).not.toHaveProperty("query");
  });
});
