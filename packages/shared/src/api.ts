export type ApiErrorCode =
  | "INVALID_REQUEST"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "UPSTREAM_UNAVAILABLE"
  | "INTERNAL_ERROR";

export type ApiErrorResponse = {
  error: { code: ApiErrorCode; message: string; requestId: string };
};
