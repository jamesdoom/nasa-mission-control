import { useQuery } from "@tanstack/react-query";
import type { MediaType } from "@mission-control/shared";
import { getMediaDetail, searchMedia } from "../../api/media";

export function useMediaSearch(
  query: string,
  mediaType: MediaType | "all",
  page: number,
) {
  return useQuery({
    queryKey: ["media", "search", query, mediaType, page],
    queryFn: () => searchMedia(query, mediaType, page),
    enabled: query.length >= 2,
    placeholderData: (previous) => previous,
  });
}

export function useMediaDetail(nasaId: string) {
  return useQuery({
    queryKey: ["media", "detail", nasaId],
    queryFn: () => getMediaDetail(nasaId),
    enabled: nasaId.length > 0,
  });
}
