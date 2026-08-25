import { useApiQuery } from "../../hooks/useApiQuery";
import type { SpaceWeatherCategory } from "@mission-control/shared";
import { getSpaceWeather } from "../../api/space-weather";

export function useSpaceWeather(
  startDate: string,
  endDate: string,
  category: SpaceWeatherCategory | "all",
) {
  return useApiQuery({
    queryKey: ["space-weather", startDate, endDate, category],
    queryFn: () => getSpaceWeather(startDate, endDate, category),
    placeholderData: true,
  });
}
