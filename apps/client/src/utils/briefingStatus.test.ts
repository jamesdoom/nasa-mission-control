import { describe, expect, it } from "vitest";
import { readResponseJson } from "../api/responseStatus";
import { briefingStatus, feedStatus } from "./briefingStatus";

const pending = { data: undefined, isError: false, isFetching: true };
const failed = { data: undefined, isError: true, isFetching: false };
const received = { data: { totalCount: 0 }, isError: false, isFetching: false };

describe("briefing request status", () => {
  it.each([
    [pending, pending, "Loading"],
    [received, pending, "Loading"],
    [failed, pending, "Loading · one source unavailable"],
    [failed, failed, "Unavailable"],
    [received, failed, "Partially available"],
    [failed, received, "Partially available"],
    [received, received, "Available"],
    [{ ...received, isFetching: true }, received, "Refreshing"],
  ])(
    "summarizes independently resolved feeds (%#)",
    (first, second, expected) => {
      expect(briefingStatus([first, second], true)).toBe(expected);
    },
  );

  it("preserves the stale warning during refresh, partial failure, and offline use", async () => {
    const data = await readResponseJson<unknown>(
      new Response("{}", {
        headers: { "x-data-status": "stale-fallback" },
      }),
    );
    const stale = { ...received, data };
    expect(briefingStatus([stale, received], true)).toBe("Stale data");
    expect(briefingStatus([stale, failed], true)).toBe("Partially available");
    expect(feedStatus(stale, true)).toBe("Stale fallback");
    expect(feedStatus({ ...stale, isFetching: true }, true)).toBe(
      "Stale fallback · refreshing",
    );
    expect(feedStatus(stale, false)).toBe("Offline · stale fallback");
  });

  it("does not equate browser connectivity, empty results, or old records with source health", () => {
    expect(feedStatus(pending, true)).toBe("Loading");
    expect(feedStatus(failed, true)).toBe("Unavailable");
    expect(feedStatus(received, true)).toBe("Available");
    expect(feedStatus(pending, false)).toBe("Offline · no data");
    expect(feedStatus(received, false)).toBe("Offline · previously loaded");
    expect(briefingStatus([received, received], false)).toBe("Offline");
  });
});
