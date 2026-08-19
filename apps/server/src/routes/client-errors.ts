import { Router } from "express";
import { z } from "zod";
import { logger } from "../lib/logger.js";
import { HttpError } from "../lib/http-error.js";

const reportSchema = z
  .object({
    kind: z.enum(["error", "unhandledrejection"]),
    message: z.string().trim().min(1).max(300),
    path: z.string().startsWith("/").max(200),
  })
  .strict();

export function createClientErrorRouter(): Router {
  const router = Router();
  router.post("/", (request, response) => {
    const parsed = reportSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new HttpError(
        400,
        "INVALID_REQUEST",
        "Invalid client error report.",
      );
    }
    logger.error("client.runtime_error", {
      requestId: request.requestId,
      kind: parsed.data.kind,
      message: parsed.data.message,
      path: parsed.data.path,
    });
    response.setHeader("cache-control", "no-store");
    response.status(204).end();
  });
  return router;
}
