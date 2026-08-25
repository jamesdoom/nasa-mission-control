import { useApiQuery } from "../../hooks/useApiQuery";
import type { MediaType } from "@mission-control/shared";
import { getMediaDetail, searchMedia } from "../../api/media";

export function useMediaSearch(
  query: string,
  mediaType: MediaType | "all",
  page: number,
) {
  return useApiQuery({
    queryKey: ["media", "search", query, mediaType, page],
    queryFn: () => searchMedia(query, mediaType, page),
    enabled: query.length >= 2,
    placeholderData: true,
  });
}

export function useMediaDetail(nasaId: string) {
  return useApiQuery({
    queryKey: ["media", "detail", nasaId],
    queryFn: () => getMediaDetail(nasaId),
    enabled: nasaId.length > 0,
  });
}
