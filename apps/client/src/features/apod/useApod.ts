import { useQueries, useQuery } from "@tanstack/react-query";
import { getApod } from "../../api/apod";
export function useApod(date?: string) {
  return useQuery({
    queryKey: ["apod", date ?? "today"],
    queryFn: () => getApod(date),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useApodHistory(endDate: string, days = 7, enabled = true) {
  const end = new Date(`${endDate}T00:00:00Z`);
  const dates = Array.from({ length: days }, (_, index) => {
    const date = new Date(end);
    date.setUTCDate(end.getUTCDate() - (days - index - 1));
    return date.toISOString().slice(0, 10);
  });
  return useQueries({
    queries: dates.map((date) => ({
      queryKey: ["apod", date],
      queryFn: () => getApod(date),
      staleTime: 24 * 60 * 60 * 1000,
      retry: 1,
      enabled,
    })),
    combine: (results) => ({
      data: results.flatMap((result) => (result.data ? [result.data] : [])),
      isPending: results.some((result) => result.isPending),
      isError: results.some((result) => result.isError),
    }),
  });
}
