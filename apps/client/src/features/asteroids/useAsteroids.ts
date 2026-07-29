import { useQuery } from "@tanstack/react-query";
import { getAsteroids } from "../../api/asteroids";

export function useAsteroids(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["asteroids", startDate, endDate],
    queryFn: () => getAsteroids(startDate, endDate),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
