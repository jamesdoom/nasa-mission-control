import { describe, expect, it } from "vitest";
import { isStaleResponse, readResponseJson } from "./responseStatus";

describe("response status", () => {
  it("retains an explicitly marked stale fallback", async () => {
    const value = await readResponseJson<{ id: string }>(
      new Response(JSON.stringify({ id: "record" }), {
        headers: { "x-data-status": "stale-fallback" },
      }),
    );
    expect(isStaleResponse(value)).toBe(true);
  });

  it("does not infer staleness from an ordinary cached response", async () => {
    const value = await readResponseJson<{ id: string }>(
      new Response(JSON.stringify({ id: "record" })),
    );
    expect(isStaleResponse(value)).toBe(false);
  });
});
