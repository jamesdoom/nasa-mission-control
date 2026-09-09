import { describe, expect, it } from "vitest";
import { contextualLinksForText } from "./contextualLinks";

describe("contextualLinksForText", () => {
  it("connects recognized subjects to their relevant mission", () => {
    expect(contextualLinksForText("Cloud bands over Jupiter")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ to: "/missions/juno" }),
      ]),
    );
  });

  it("uses the observatory fallback when no specific subject is recognized", () => {
    expect(contextualLinksForText("A mysterious distant object")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ to: "/missions/webb" }),
      ]),
    );
  });
});
