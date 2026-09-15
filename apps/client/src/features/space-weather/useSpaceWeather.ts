import { useApiQuery } from "../../hooks/useApiQuery";
import type { SpaceWeatherCategory } from "@mission-control/shared";
import { getSpaceWeather } from "../../api/space-weather";

export function useSpaceWeather(
  startDate: string,
  endDate: string,
  category: SpaceWeatherCategory | "all",
) {
  return useApiQuery({
    staleTime: 5 * 60 * 1000,
    queryKey: ["space-weather", startDate, endDate, category],
    queryFn: (signal) => getSpaceWeather(startDate, endDate, category, signal),
    placeholderData: true,
  });
}
