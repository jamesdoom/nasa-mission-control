export type TriviaDifficulty = "cadet" | "specialist" | "commander";
export type TriviaCategory =
  "moon" | "planets" | "observatories" | "deep-space";

export type TriviaQuestion = {
  id: string;
  difficulty: TriviaDifficulty;
  category: TriviaCategory;
  prompt: string;
  choices: string[];
  answer: number;
  explanation: string;
  source: { label: string; url: string };
  verifiedAt: string;
};

const difficulties = new Set<TriviaDifficulty>([
  "cadet",
  "specialist",
  "commander",
]);
const categories = new Set<TriviaCategory>([
  "moon",
  "planets",
  "observatories",
  "deep-space",
]);
let cachedQuestions: TriviaQuestion[] | undefined;
export const triviaQuestionCount = 96;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseTriviaQuestions(value: unknown): TriviaQuestion[] {
  if (!Array.isArray(value)) throw new Error("Trivia content is not a list.");
  const questions = value.map((item) => {
    if (
      !isRecord(item) ||
      typeof item.id !== "string" ||
      !difficulties.has(item.difficulty as TriviaDifficulty) ||
      !categories.has(item.category as TriviaCategory) ||
      typeof item.prompt !== "string" ||
      !Array.isArray(item.choices) ||
      item.choices.length !== 4 ||
      !item.choices.every((choice) => typeof choice === "string") ||
      typeof item.answer !== "number" ||
      !Number.isInteger(item.answer) ||
      item.answer < 0 ||
      item.answer >= item.choices.length ||
      typeof item.explanation !== "string" ||
      !isRecord(item.source) ||
      typeof item.source.label !== "string" ||
      typeof item.source.url !== "string" ||
      typeof item.verifiedAt !== "string"
    ) {
      throw new Error("A trivia question failed content validation.");
    }
    return item as TriviaQuestion;
  });
  if (questions.length !== triviaQuestionCount) {
    throw new Error("The trivia bank is incomplete.");
  }
  return questions;
}

export async function loadTriviaQuestions(): Promise<TriviaQuestion[]> {
  if (cachedQuestions) return cachedQuestions;
  const response = await fetch("/content/trivia.json");
  if (!response.ok) throw new Error("The trivia bank could not be loaded.");
  cachedQuestions = parseTriviaQuestions(await response.json());
  return cachedQuestions;
}

export function resetTriviaCache(): void {
  cachedQuestions = undefined;
}
