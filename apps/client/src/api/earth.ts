import type {
  ApiErrorResponse,
  EarthCollection,
  EarthObservation,
} from "@mission-control/shared";
import { ApiError } from "./apod";
import { readResponseJson } from "./responseStatus";

export async function getEarthObservation(
  collection: EarthCollection,
  date?: string,
): Promise<EarthObservation> {
  const params = new URLSearchParams({ collection });
  if (date) params.set("date", date);
  const response = await fetch(`/api/earth?${params}`, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    const fallback = "Mission Control could not retrieve Earth observations.";
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
  return readResponseJson<EarthObservation>(response);
}
