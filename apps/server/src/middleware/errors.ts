import type { ErrorRequestHandler, RequestHandler } from "express";
import type { ApiErrorResponse } from "@mission-control/shared";
import { randomUUID } from "node:crypto";
import { HttpError } from "../lib/http-error.js";
import { logger } from "../lib/logger.js";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export const requestId: RequestHandler = (request, response, next) => {
  const supplied = request.header("x-request-id");
  request.requestId =
    supplied && /^[A-Za-z0-9._-]{1,64}$/.test(supplied)
      ? supplied
      : randomUUID();
  response.setHeader("x-request-id", request.requestId);
  next();
};

export const requestLogger: RequestHandler = (request, response, next) => {
  const startedAt = performance.now();
  const path = request.path;
  response.on("finish", () => {
    logger.info("request.complete", {
      requestId: request.requestId,
      method: request.method,
      path,
      status: response.statusCode,
      durationMs: Math.round(performance.now() - startedAt),
    });
  });
  next();
};

export const notFound: RequestHandler = (request, _response, next) => {
  next(
    new HttpError(
      404,
      "NOT_FOUND",
      `No route exists for ${request.method} ${request.path}.`,
    ),
  );
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  request,
  response,
  _next,
) => {
  const known = error instanceof HttpError;
  const status = known ? error.status : 500;
  const body: ApiErrorResponse = {
    error: {
      code: known ? error.code : "INTERNAL_ERROR",
      message: known ? error.message : "An unexpected server error occurred.",
      requestId: request.requestId,
      retryable: status >= 500,
    },
  };
  if (!known) {
    logger.error("request.unhandled_error", {
      requestId: request.requestId,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
  }
  response.setHeader("cache-control", "no-store");
  if (body.error.retryable) response.setHeader("retry-after", "30");
  response.status(status).json(body);
};
