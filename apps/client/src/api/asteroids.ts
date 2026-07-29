import type { ApiErrorResponse, AsteroidFeed } from "@mission-control/shared";
import { ApiError } from "./apod";

export async function getAsteroids(
  startDate: string,
  endDate: string,
): Promise<AsteroidFeed> {
  const query = new URLSearchParams({ startDate, endDate });
  const response = await fetch(`/api/asteroids?${query}`, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    const fallback = "Mission Control could not retrieve asteroid encounters.";
    try {
      const body = (await response.json()) as ApiErrorResponse;
      throw new ApiError(body.error.message || fallback, body.error.requestId);
    } catch (error: unknown) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(fallback);
    }
  }
  return (await response.json()) as AsteroidFeed;
}
