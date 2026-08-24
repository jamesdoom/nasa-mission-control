import { beforeEach, describe, expect, it } from "vitest";
import {
  createFlightLogBackup,
  previewFlightLogBackup,
  restoreFlightLogBackup,
} from "./flightLogBackup";

describe("Flight Log backup", () => {
  beforeEach(() => localStorage.clear());

  it("exports and restores only supported browser-local records", () => {
    localStorage.setItem(
      "mission-control:journey-favorites:v1",
      JSON.stringify(["moon-then-now"]),
    );
    localStorage.setItem("unrelated", "secret");
    const backup = createFlightLogBackup(localStorage);
    localStorage.clear();
    expect(restoreFlightLogBackup(backup, localStorage)).toBe(1);
    expect(localStorage.getItem("mission-control:journey-favorites:v1")).toBe(
      '["moon-then-now"]',
    );
    expect(localStorage.getItem("unrelated")).toBeNull();
  });

  it("rejects malformed and unsupported files", () => {
    expect(() => restoreFlightLogBackup("not json", localStorage)).toThrow(
      "valid Mission Control JSON backup",
    );
    expect(() =>
      restoreFlightLogBackup(
        JSON.stringify({ version: 2, records: {} }),
        localStorage,
      ),
    ).toThrow("not a supported Mission Control backup");
  });

  it("previews overlap and merges arrays and nested personalization with local conflicts winning", () => {
    localStorage.setItem(
      "mission-control:mission-favorites:v1",
      JSON.stringify(["apollo-11"]),
    );
    localStorage.setItem(
      "mission-control:flight-log-personalization:v1",
      JSON.stringify({
        version: 1,
        annotations: { "mission:apollo-11": { note: "Local" } },
      }),
    );
    const backup = JSON.stringify({
      version: 1,
      exportedAt: "2026-08-24T00:00:00.000Z",
      records: {
        "mission-control:mission-favorites:v1": ["artemis-i"],
        "mission-control:flight-log-personalization:v1": {
          version: 1,
          annotations: {
            "mission:apollo-11": { note: "Incoming" },
            "mission:artemis-i": { note: "New" },
          },
        },
      },
    });
    expect(previewFlightLogBackup(backup, localStorage)).toMatchObject({
      supportedRecords: 2,
      existingRecords: 2,
    });
    restoreFlightLogBackup(backup, localStorage, "merge");
    expect(
      JSON.parse(
        localStorage.getItem("mission-control:mission-favorites:v1") ?? "[]",
      ),
    ).toEqual(["apollo-11", "artemis-i"]);
    const personalization = JSON.parse(
      localStorage.getItem("mission-control:flight-log-personalization:v1") ??
        "{}",
    ) as { annotations: Record<string, { note: string }> };
    expect(personalization.annotations["mission:apollo-11"]?.note).toBe(
      "Local",
    );
    expect(personalization.annotations["mission:artemis-i"]?.note).toBe("New");
  });
});
