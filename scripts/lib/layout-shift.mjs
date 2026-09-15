export function maximumLayoutShiftSession(entries) {
  let largest = 0;
  let total = 0;
  let start = 0;
  let previous = 0;
  for (const entry of entries) {
    if (entry.hadRecentInput) continue;
    if (
      total === 0 ||
      entry.startTime - previous >= 1000 ||
      entry.startTime - start >= 5000
    ) {
      start = entry.startTime;
      total = 0;
    }
    total += entry.value;
    previous = entry.startTime;
    largest = Math.max(largest, total);
  }
  return largest;
}
