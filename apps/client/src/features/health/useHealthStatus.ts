import { useQuery } from "@tanstack/react-query";
import { getHealthStatus } from "../../api/health";

export function useHealthStatus() {
  return useQuery({
    queryKey: ["health"],
    queryFn: getHealthStatus,
    staleTime: 30_000,
    retry: 1,
  });
}
