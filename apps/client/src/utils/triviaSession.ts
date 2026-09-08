import * as z from "zod/v4-mini";

export const triviaSessionKey = "mission-control:trivia-session:v1";
const schema = z.object({
  difficulty: z.enum(["cadet", "specialist", "commander"]),
  category: z.enum(["all", "moon", "planets", "observatories", "deep-space"]),
  ids: z.array(z.string()),
  index: z.number(),
  selected: z.nullable(z.number()),
  score: z.number(),
  streak: z.number(),
  complete: z.boolean(),
});
export type TriviaSession = z.infer<typeof schema>;
let sessionFallback: TriviaSession | null = null;
export function readTriviaSession(): TriviaSession | null {
  if (sessionFallback) return sessionFallback;
  try {
    const result = schema.safeParse(
      JSON.parse(localStorage.getItem(triviaSessionKey) ?? "null") as unknown,
    );
    if (
      !result.success ||
      result.data.index >= result.data.ids.length ||
      new Set(result.data.ids).size !== result.data.ids.length
    )
      return null;
    const session = result.data;
    if (
      session.ids.length > 96 ||
      ![session.index, session.score, session.streak].every(
        (n) => Number.isInteger(n) && n >= 0 && n <= session.ids.length,
      ) ||
      (session.selected !== null &&
        (!Number.isInteger(session.selected) ||
          session.selected < 0 ||
          session.selected > 3))
    )
      return null;
    if (
      session.score > session.index + (session.selected === null ? 0 : 1) ||
      session.streak > session.score
    )
      return null;
    return session;
  } catch {
    return null;
  }
}
export function writeTriviaSession(session: TriviaSession): boolean {
  try {
    localStorage.setItem(triviaSessionKey, JSON.stringify(session));
    sessionFallback = null;
    return true;
  } catch {
    sessionFallback = session;
    return false;
  }
}
