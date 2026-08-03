import { useQuery } from "@tanstack/react-query";
import type { EarthCollection } from "@mission-control/shared";
import { getEarthObservation } from "../../api/earth";

export function useEarthObservation(
  collection: EarthCollection,
  date?: string,
) {
  return useQuery({
    queryKey: ["earth", collection, date ?? "latest"],
    queryFn: () => getEarthObservation(collection, date),
    placeholderData: (previous) => previous,
  });
}
