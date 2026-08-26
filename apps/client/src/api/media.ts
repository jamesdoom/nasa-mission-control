import type {
  ApiErrorResponse,
  MediaDetail,
  MediaSearch,
  MediaType,
} from "@mission-control/shared";
import { ApiError } from "./apod";
import { readResponseJson } from "./responseStatus";

async function request<T>(url: string, fallback: string): Promise<T> {
  const response = await fetch(url, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
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
  return readResponseJson<T>(response);
}

export function searchMedia(
  query: string,
  mediaType: MediaType | "all",
  page: number,
): Promise<MediaSearch> {
  const params = new URLSearchParams({
    q: query,
    mediaType,
    page: String(page),
  });
  return request(
    `/api/media/search?${params}`,
    "Mission Control could not search the NASA media archive.",
  );
}

export function getMediaDetail(nasaId: string): Promise<MediaDetail> {
  return request(
    `/api/media/${encodeURIComponent(nasaId)}`,
    "Mission Control could not retrieve this NASA media asset.",
  );
}
