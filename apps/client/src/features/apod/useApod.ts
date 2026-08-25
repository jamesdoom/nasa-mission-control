import { useApiQuery } from "../../hooks/useApiQuery";
import { getApod } from "../../api/apod";
export function useApod(date?: string) {
  return useApiQuery({
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
  return useApiQuery({
    queryKey: ["apod-history", ...dates],
    queryFn: () => Promise.all(dates.map((date) => getApod(date))),
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
    enabled,
  });
}
