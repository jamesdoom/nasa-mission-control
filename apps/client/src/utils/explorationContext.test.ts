import { describe, expect, it } from "vitest";
import {
  explorationLink,
  keepExplorationContext,
  safeExplorationPath,
} from "./explorationContext";
import {
  createFlightLogBackup,
  restoreFlightLogBackup,
} from "./flightLogBackup";
import { readTriviaSession } from "./triviaSession";

describe("exploration continuity", () => {
  it("preserves a learning step through filtered evidence and its detail", () => {
    const start = "/learn?track=mars-evidence#step-instrument";
    const search = explorationLink("/media?q=Mars&page=2", start);
    const detail = explorationLink("/media/example", search);
    const back = new URL(detail, "https://example.com").searchParams.get(
      "returnTo",
    );
    expect(back).toBe(search);
    expect(
      new URL(back ?? "", "https://example.com").searchParams.get("returnTo"),
    ).toBe(start);
    expect(
      keepExplorationContext(new URLSearchParams(search.split("?")[1]), {
        q: "Curiosity",
        page: "3",
      }).get("returnTo"),
    ).toBe(start);
  });
  it("rejects external and malformed stored navigation targets", () => {
    for (const path of [
      "//evil.example/media",
      "https://evil.example",
      "/\\evil.example",
      "javascript:alert(1)",
      "/unknown",
      "/media\n",
      "/media?" + "x".repeat(3000),
    ])
      expect(safeExplorationPath(path)).toBe(false);
  });
  it("includes exploration and trivia state in existing backups", () => {
    localStorage.clear();
    localStorage.setItem(
      "mission-control:saved-explorations:v1",
      JSON.stringify([
        {
          path: "/media?q=Mars",
          title: "Mars",
          savedAt: "2026-09-08T00:00:00Z",
        },
      ]),
    );
    localStorage.setItem(
      "mission-control:trivia-session:v1",
      JSON.stringify({
        difficulty: "cadet",
        category: "all",
        ids: ["apollo-destination"],
        index: 0,
        selected: 1,
        score: 1,
        streak: 1,
        complete: false,
      }),
    );
    const backup = createFlightLogBackup(localStorage);
    localStorage.clear();
    restoreFlightLogBackup(backup, localStorage, "replace");
    expect(
      localStorage.getItem("mission-control:saved-explorations:v1"),
    ).toContain("Mars");
    expect(readTriviaSession()?.score).toBe(1);
    localStorage.clear();
  });
});
