import { describe, expect, it } from "vitest";
import { triviaQuestions } from "./trivia";

describe("source-checked trivia bank", () => {
  it("provides valid answers, explanations, and official sources", () => {
    expect(new Set(triviaQuestions.map((question) => question.id)).size).toBe(
      triviaQuestions.length,
    );
    for (const question of triviaQuestions) {
      expect(question.choices).toHaveLength(4);
      expect(question.answer).toBeGreaterThanOrEqual(0);
      expect(question.answer).toBeLessThan(question.choices.length);
      expect(question.explanation.length).toBeGreaterThan(30);
      expect(new URL(question.source.url).hostname.endsWith("nasa.gov")).toBe(
        true,
      );
    }
  });
});
