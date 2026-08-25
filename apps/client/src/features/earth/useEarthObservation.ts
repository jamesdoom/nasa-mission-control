import { useApiQuery } from "../../hooks/useApiQuery";
import type { EarthCollection } from "@mission-control/shared";
import { getEarthObservation } from "../../api/earth";

export function useEarthObservation(
  collection: EarthCollection,
  date?: string,
) {
  return useApiQuery({
    queryKey: ["earth", collection, date ?? "latest"],
    queryFn: () => getEarthObservation(collection, date),
  });
}
