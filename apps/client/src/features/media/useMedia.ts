import { useApiQuery } from "../../hooks/useApiQuery";
import type { MediaType } from "@mission-control/shared";
import { getMediaDetail, searchMedia } from "../../api/media";

export function useMediaSearch(
  query: string,
  mediaType: MediaType | "all",
  page: number,
) {
  return useApiQuery({
    staleTime: 5 * 60 * 1000,
    queryKey: ["media", "search", query, mediaType, page],
    queryFn: (signal) => searchMedia(query, mediaType, page, signal),
    enabled: query.length >= 2,
    placeholderData: true,
  });
}

export function useMediaDetail(nasaId: string) {
  return useApiQuery({
    staleTime: 5 * 60 * 1000,
    queryKey: ["media", "detail", nasaId],
    queryFn: (signal) => getMediaDetail(nasaId, signal),
    enabled: nasaId.length > 0,
  });
}
