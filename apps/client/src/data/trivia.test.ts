import { describe, expect, it } from "vitest";
import {
  parseTriviaQuestions,
  type TriviaCategory,
  type TriviaDifficulty,
} from "./trivia";
import triviaContent from "../../public/content/trivia.json";

const triviaQuestions = parseTriviaQuestions(triviaContent);

describe("source-checked trivia bank", () => {
  it("provides unique, readable questions with dated official sources", () => {
    expect(new Set(triviaQuestions.map((question) => question.id)).size).toBe(
      triviaQuestions.length,
    );
    const normalizedPrompts = triviaQuestions.map((question) =>
      question.prompt
        .toLocaleLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim(),
    );
    expect(new Set(normalizedPrompts).size).toBe(triviaQuestions.length);
    for (const question of triviaQuestions) {
      expect(question.choices).toHaveLength(4);
      expect(new Set(question.choices).size).toBe(4);
      expect(question.answer).toBeGreaterThanOrEqual(0);
      expect(question.answer).toBeLessThan(question.choices.length);
      expect(question.prompt.length).toBeLessThanOrEqual(120);
      expect(question.explanation.length).toBeGreaterThanOrEqual(80);
      expect(question.explanation.length).toBeLessThanOrEqual(280);
      expect(question.prompt).not.toMatch(
        /\b(latest|currently|today|right now)\b/i,
      );
      expect(new URL(question.source.url).hostname.endsWith("nasa.gov")).toBe(
        true,
      );
      expect(question.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Date.parse(question.verifiedAt)).toBeLessThanOrEqual(Date.now());
    }
  });

  it("balances existing topics, difficulties, and answer positions", () => {
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
          triviaQuestions.filter(
            (question) =>
              question.difficulty === difficulty &&
              question.category === category,
          ).length,
        ).toBeGreaterThanOrEqual(4);
      }
    }
    for (const category of categories) {
      expect(
        triviaQuestions.filter((question) => question.category === category),
      ).toHaveLength(24);
      expect(
        triviaQuestions.filter(
          (question) =>
            question.category === category &&
            question.difficulty === "specialist",
        ),
      ).toHaveLength(9);
      expect(
        triviaQuestions.filter(
          (question) =>
            question.category === category &&
            question.difficulty === "commander",
        ),
      ).toHaveLength(7);
    }
    const answerCounts = [0, 1, 2, 3].map(
      (position) =>
        triviaQuestions.filter((question) => question.answer === position)
          .length,
    );
    expect(Math.max(...answerCounts) - Math.min(...answerCounts)).toBe(0);
  });
});
