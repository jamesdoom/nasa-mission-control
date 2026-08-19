import type {
  ApiErrorResponse,
  SpaceWeatherCategory,
  SpaceWeatherFeed,
} from "@mission-control/shared";
import { ApiError } from "./apod";

export async function getSpaceWeather(
  startDate: string,
  endDate: string,
  category: SpaceWeatherCategory | "all",
): Promise<SpaceWeatherFeed> {
  const params = new URLSearchParams({ startDate, endDate, category });
  const response = await fetch(`/api/space-weather?${params}`, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    const fallback =
      "Mission Control could not retrieve space weather observations.";
    try {
      const body = (await response.json()) as ApiErrorResponse;
      throw new ApiError(
        body.error.message || fallback,
        body.error.requestId,
        body.error.retryable,
      );
    } catch (error: unknown) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(fallback);
    }
  }
  return (await response.json()) as SpaceWeatherFeed;
}
