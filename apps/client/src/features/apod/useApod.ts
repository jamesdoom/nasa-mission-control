import { useQuery } from "@tanstack/react-query";
import { getApod } from "../../api/apod";
export function useApod(date?: string) {
  return useQuery({
    queryKey: ["apod", date ?? "today"],
    queryFn: () => getApod(date),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
