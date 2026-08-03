import { useQuery } from "@tanstack/react-query";
import type { SpaceWeatherCategory } from "@mission-control/shared";
import { getSpaceWeather } from "../../api/space-weather";

export function useSpaceWeather(
  startDate: string,
  endDate: string,
  category: SpaceWeatherCategory | "all",
) {
  return useQuery({
    queryKey: ["space-weather", startDate, endDate, category],
    queryFn: () => getSpaceWeather(startDate, endDate, category),
    placeholderData: (previous) => previous,
  });
}
