import { describe, expect, it } from "vitest";
import {
  triviaQuestions,
  type TriviaCategory,
  type TriviaDifficulty,
} from "./trivia";

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

  it("covers every knowledge category at every difficulty", () => {
    const difficulties: TriviaDifficulty[] = [
      "cadet",
      "specialist",
      "commander",
    ];
    const categories: TriviaCategory[] = [
      "moon",
      "planets",
      "observatories",
      "deep-space",
    ];

    for (const difficulty of difficulties) {
      for (const category of categories) {
        expect(
          triviaQuestions.some(
            (question) =>
              question.difficulty === difficulty &&
              question.category === category,
          ),
        ).toBe(true);
      }
    }
  });
});
