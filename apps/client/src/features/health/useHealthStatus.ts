import { useApiQuery } from "../../hooks/useApiQuery";
import { getHealthStatus } from "../../api/health";

export function useHealthStatus() {
  return useApiQuery({
    queryKey: ["health"],
    queryFn: getHealthStatus,
    staleTime: 30_000,
    retry: 1,
  });
}
