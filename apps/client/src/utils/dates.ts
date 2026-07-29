const dayMs = 86_400_000;

export function utcDate(offsetDays = 0): string {
  return new Date(Date.now() + offsetDays * dayMs).toISOString().slice(0, 10);
}
