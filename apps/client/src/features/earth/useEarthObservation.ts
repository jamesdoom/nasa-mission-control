import { useApiQuery } from "../../hooks/useApiQuery";
import type { EarthCollection } from "@mission-control/shared";
import { getEarthObservation } from "../../api/earth";

export function useEarthObservation(
  collection: EarthCollection,
  date?: string,
) {
  return useApiQuery({
    staleTime: 5 * 60 * 1000,
    queryKey: ["earth", collection, date ?? "latest"],
    queryFn: (signal) => getEarthObservation(collection, date, signal),
  });
}
