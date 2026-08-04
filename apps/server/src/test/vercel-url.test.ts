import { describe, expect, it } from "vitest";
import {
  removeVercelRouteParameter,
  removeVercelRouteQuery,
} from "../lib/vercel-url.js";

describe("Vercel API adapter", () => {
  it("removes the injected catch-all parameter and preserves app queries", () => {
    expect(
      removeVercelRouteParameter("/api/apod?date=2026-08-04&path=apod"),
    ).toBe("/api/apod?date=2026-08-04");
  });

  it("removes Vercel's pre-parsed path field without changing app fields", () => {
    const query = { date: "2026-08-04", path: ["apod"] };
    removeVercelRouteQuery(query);
    expect(query).toEqual({ date: "2026-08-04" });
  });
});
