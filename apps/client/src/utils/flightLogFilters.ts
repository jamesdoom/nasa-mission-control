export type FlightLogCollection =
  "all" | "journeys" | "asteroids" | "missions" | "media" | "apod";

export type FlightLogSort = "default" | "az" | "za";

const collections: FlightLogCollection[] = [
  "all",
  "journeys",
  "asteroids",
  "missions",
  "media",
  "apod",
];
const sorts: FlightLogSort[] = ["default", "az", "za"];

export function flightLogCollectionFrom(
  value: string | null,
): FlightLogCollection {
  return collections.includes(value as FlightLogCollection)
    ? (value as FlightLogCollection)
    : "all";
}

export function flightLogSortFrom(value: string | null): FlightLogSort {
  return sorts.includes(value as FlightLogSort)
    ? (value as FlightLogSort)
    : "default";
}

export function matchesFlightLogSearch(
  query: string,
  values: (string | null | undefined)[],
): boolean {
  const normalized = query.trim().toLocaleLowerCase();
  return (
    normalized.length === 0 ||
    values.some((value) => value?.toLocaleLowerCase().includes(normalized))
  );
}

export function sortFlightLogItems<T>(
  items: T[],
  sort: FlightLogSort,
  title: (item: T) => string,
): T[] {
  if (sort === "default") return items;
  const direction = sort === "az" ? 1 : -1;
  return [...items].sort(
    (left, right) =>
      title(left).localeCompare(title(right), undefined, {
        numeric: true,
        sensitivity: "base",
      }) * direction,
  );
}
