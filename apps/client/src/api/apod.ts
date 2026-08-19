import type { ApiErrorResponse, Apod } from "@mission-control/shared";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly requestId?: string,
    public readonly retryable = true,
  ) {
    super(message);
  }
}

export async function getApod(date?: string): Promise<Apod> {
  const query = date ? `?${new URLSearchParams({ date })}` : "";
  const response = await fetch(`/api/apod${query}`, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    const fallback = "Mission Control could not retrieve this observation.";
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
  return (await response.json()) as Apod;
}
